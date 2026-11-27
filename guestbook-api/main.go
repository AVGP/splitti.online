package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/mail"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
	"unicode"
	"unicode/utf8"

	_ "modernc.org/sqlite"
)

const (
	defaultPort        = "8080"
	defaultDBPath      = "./data/guestbook.db"
	defaultCORSOrigins = "https://splitti.online,https://www.splitti.online,http://localhost:8080"
	pageSize           = 5
	maxNameRunes       = 80
	maxEmailRunes      = 254
	maxTextRunes       = 300
	maxRequestBytes    = 8 * 1024
)

// Entry represents a public guestbook entry returned by the API.
// Email is intentionally stored in SQLite but omitted from public GET responses.
type Entry struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Text      string `json:"text"`
	CreatedAt string `json:"created_at"`
}

// CreateEntryRequest is the expected JSON payload for POST requests.
type CreateEntryRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Text  string `json:"text"`
}

// PageResponse is the paginated JSON response returned by GET requests.
type PageResponse struct {
	Entries      []Entry `json:"entries"`
	Page         int     `json:"page"`
	PerPage      int     `json:"per_page"`
	TotalEntries int     `json:"total_entries"`
	TotalPages   int     `json:"total_pages"`
	HasPrev      bool    `json:"has_prev"`
	HasNext      bool    `json:"has_next"`
}

type errorResponse struct {
	Error string `json:"error"`
}

type Server struct {
	db             *sql.DB
	allowedOrigins map[string]bool
	allowAllCORS   bool
	rateLimiter    *ipRateLimiter
}

// ipRateLimiter is a lightweight fixed-window rate limiter for POST requests.
type ipRateLimiter struct {
	mu      sync.Mutex
	window  time.Duration
	limit   int
	entries map[string]*rateWindow
}

type rateWindow struct {
	count   int
	resetAt time.Time
}

func newIPRateLimiter(limit int, window time.Duration) *ipRateLimiter {
	return &ipRateLimiter{
		window:  window,
		limit:   limit,
		entries: make(map[string]*rateWindow),
	}
}

func (rl *ipRateLimiter) allow(ip string) bool {
	if rl == nil || rl.limit <= 0 {
		return true
	}
	now := time.Now()
	rl.mu.Lock()
	defer rl.mu.Unlock()

	if len(rl.entries) > 10000 {
		for k, v := range rl.entries {
			if now.After(v.resetAt) {
				delete(rl.entries, k)
			}
		}
	}

	w, ok := rl.entries[ip]
	if !ok || now.After(w.resetAt) {
		rl.entries[ip] = &rateWindow{
			count:   1,
			resetAt: now.Add(rl.window),
		}
		return true
	}
	if w.count >= rl.limit {
		return false
	}
	w.count++
	return true
}

func openDB(dbPath string) (*sql.DB, error) {
	if dbPath != ":memory:" {
		dir := filepath.Dir(dbPath)
		if dir != "" && dir != "." {
			if err := os.MkdirAll(dir, 0o755); err != nil {
				return nil, fmt.Errorf("create db directory: %w", err)
			}
		}
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("open sqlite db: %w", err)
	}

	// SQLite works best with a single writer connection when using WAL.
	db.SetMaxOpenConns(1)

	pragmas := []string{
		"PRAGMA journal_mode=WAL;",
		"PRAGMA synchronous=NORMAL;",
		"PRAGMA busy_timeout=5000;",
		"PRAGMA foreign_keys=ON;",
	}
	for _, p := range pragmas {
		if _, err := db.Exec(p); err != nil {
			db.Close()
			return nil, fmt.Errorf("exec %q: %w", p, err)
		}
	}

	const schema = `
	CREATE TABLE IF NOT EXISTS entries (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		text TEXT NOT NULL,
		created_at TEXT NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_entries_id_desc ON entries(id DESC);
	`
	if _, err := db.Exec(schema); err != nil {
		db.Close()
		return nil, fmt.Errorf("init schema: %w", err)
	}

	return db, nil
}

func parseAllowedOrigins(raw string) (map[string]bool, bool) {
	allowed := make(map[string]bool)
	for _, part := range strings.Split(raw, ",") {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		if origin == "*" {
			return nil, true
		}
		allowed[strings.TrimRight(origin, "/")] = true
	}
	return allowed, false
}

func newServer(db *sql.DB, corsOrigins string, rateLimit int) *Server {
	allowed, allowAll := parseAllowedOrigins(corsOrigins)
	return &Server{
		db:             db,
		allowedOrigins: allowed,
		allowAllCORS:   allowAll,
		rateLimiter:    newIPRateLimiter(rateLimit, time.Minute),
	}
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.handleHealth)
	mux.HandleFunc("/entries", s.handleEntries)
	mux.HandleFunc("/", s.handleRoot)
	return s.withCORS(mux)
}

func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimRight(r.Header.Get("Origin"), "/")
		if origin != "" {
			if s.allowAllCORS {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			} else if s.allowedOrigins[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Add("Vary", "Origin")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		writeJSON(w, http.StatusNotFound, errorResponse{Error: "not found"})
		return
	}
	s.handleEntries(w, r)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Error: "method not allowed"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := s.db.PingContext(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, errorResponse{Error: "database unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleEntries(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleListEntries(w, r)
	case http.MethodPost:
		s.handleCreateEntry(w, r)
	default:
		w.Header().Set("Allow", "GET, POST, OPTIONS")
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Error: "method not allowed"})
	}
}

func (s *Server) handleListEntries(w http.ResponseWriter, r *http.Request) {
	page := 1
	if rawPage := strings.TrimSpace(r.URL.Query().Get("page")); rawPage != "" {
		parsed, err := strconv.Atoi(rawPage)
		if err != nil || parsed < 1 {
			writeJSON(w, http.StatusBadRequest, errorResponse{Error: "page must be a positive integer"})
			return
		}
		page = parsed
	}

	ctx := r.Context()
	var totalEntries int
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM entries`).Scan(&totalEntries); err != nil {
		log.Printf("count entries error: %v", err)
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "failed to load guestbook"})
		return
	}

	totalPages := (totalEntries + pageSize - 1) / pageSize
	if totalPages == 0 {
		totalPages = 1
	}

	offset := (page - 1) * pageSize
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, name, text, created_at FROM entries ORDER BY id DESC LIMIT ? OFFSET ?`,
		pageSize,
		offset,
	)
	if err != nil {
		log.Printf("query entries error: %v", err)
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "failed to load guestbook"})
		return
	}
	defer rows.Close()

	entries := make([]Entry, 0, pageSize)
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.Name, &e.Text, &e.CreatedAt); err != nil {
			log.Printf("scan entry error: %v", err)
			writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "failed to read guestbook"})
			return
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		log.Printf("rows iteration error: %v", err)
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "failed to read guestbook"})
		return
	}

	resp := PageResponse{
		Entries:      entries,
		Page:         page,
		PerPage:      pageSize,
		TotalEntries: totalEntries,
		TotalPages:   totalPages,
		HasPrev:      page > 1,
		HasNext:      page < totalPages,
	}

	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) handleCreateEntry(w http.ResponseWriter, r *http.Request) {
	ip := clientIP(r)
	if !s.rateLimiter.allow(ip) {
		writeJSON(w, http.StatusTooManyRequests, errorResponse{Error: "too many submissions, please wait a minute"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
	defer r.Body.Close()

	var req CreateEntryRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		var maxBytesErr *http.MaxBytesError
		if errors.As(err, &maxBytesErr) {
			writeJSON(w, http.StatusRequestEntityTooLarge, errorResponse{Error: "request body too large"})
			return
		}
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "invalid JSON payload"})
		return
	}

	name, email, text, err := validateEntryInput(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: err.Error()})
		return
	}

	createdAt := time.Now().UTC().Format(time.RFC3339)
	res, err := s.db.ExecContext(
		r.Context(),
		`INSERT INTO entries (name, email, text, created_at) VALUES (?, ?, ?, ?)`,
		name,
		email,
		text,
		createdAt,
	)
	if err != nil {
		log.Printf("insert entry error: %v", err)
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "failed to save entry"})
		return
	}

	id, err := res.LastInsertId()
	if err != nil {
		log.Printf("last insert id error: %v", err)
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "failed to save entry"})
		return
	}

	entry := Entry{
		ID:        id,
		Name:      name,
		Text:      text,
		CreatedAt: createdAt,
	}
	writeJSON(w, http.StatusCreated, entry)
}

func validateEntryInput(req CreateEntryRequest) (string, string, string, error) {
	name := sanitizePlainText(req.Name, false)
	if name == "" {
		return "", "", "", errors.New("name is required")
	}
	if utf8.RuneCountInString(name) > maxNameRunes {
		return "", "", "", fmt.Errorf("name must be %d characters or fewer", maxNameRunes)
	}

	email := strings.TrimSpace(req.Email)
	if email == "" {
		return "", "", "", errors.New("email is required")
	}
	if utf8.RuneCountInString(email) > maxEmailRunes {
		return "", "", "", fmt.Errorf("email must be %d characters or fewer", maxEmailRunes)
	}
	parsedAddr, err := mail.ParseAddress(email)
	if err != nil || parsedAddr.Address != email || !strings.Contains(parsedAddr.Address, "@") {
		return "", "", "", errors.New("email must be a valid email address")
	}

	text := sanitizePlainText(req.Text, true)
	if text == "" {
		return "", "", "", errors.New("text is required")
	}
	if utf8.RuneCountInString(text) > maxTextRunes {
		return "", "", "", fmt.Errorf("text must be %d characters or fewer", maxTextRunes)
	}

	return name, email, text, nil
}

// sanitizePlainText strips disallowed control characters and normalizes line endings.
func sanitizePlainText(input string, allowNewlines bool) string {
	input = strings.ReplaceAll(input, "\r\n", "\n")
	input = strings.ReplaceAll(input, "\r", "\n")

	var b strings.Builder
	b.Grow(len(input))
	for _, r := range input {
		if r == '\n' {
			if allowNewlines {
				b.WriteRune('\n')
			} else {
				b.WriteRune(' ')
			}
			continue
		}
		if r == '\t' {
			b.WriteRune(' ')
			continue
		}
		if unicode.IsControl(r) {
			continue
		}
		b.WriteRune(r)
	}
	return strings.TrimSpace(b.String())
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			if ip := strings.TrimSpace(parts[0]); ip != "" {
				return ip
			}
		}
	}
	if xri := strings.TrimSpace(r.Header.Get("X-Real-IP")); xri != "" {
		return xri
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json error: %v", err)
	}
}

func envOrDefault(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func runHealthcheck(port string) int {
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get("http://127.0.0.1:" + port + "/healthz")
	if err != nil {
		return 1
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return 1
	}
	return 0
}

func main() {
	healthcheckFlag := flag.Bool("healthcheck", false, "run HTTP healthcheck against local server and exit")
	flag.Parse()

	port := envOrDefault("PORT", defaultPort)
	if *healthcheckFlag {
		os.Exit(runHealthcheck(port))
	}

	dbPath := envOrDefault("DB_PATH", defaultDBPath)
	corsOrigins := envOrDefault("ALLOWED_ORIGINS", defaultCORSOrigins)

	rateLimit := 10
	if rawLimit := strings.TrimSpace(os.Getenv("RATE_LIMIT_PER_MIN")); rawLimit != "" {
		if parsed, err := strconv.Atoi(rawLimit); err == nil && parsed >= 0 {
			rateLimit = parsed
		}
	}

	db, err := openDB(dbPath)
	if err != nil {
		log.Fatalf("database init failed: %v", err)
	}
	defer db.Close()

	srv := newServer(db, corsOrigins, rateLimit)
	httpServer := &http.Server{
		Addr:              ":" + port,
		Handler:           srv.routes(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		log.Printf("guestbook server listening on :%s (db=%s)", port, dbPath)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errCh:
		log.Fatalf("server error: %v", err)
	case sig := <-sigCh:
		log.Printf("received signal %s, shutting down...", sig)
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(ctx); err != nil {
			log.Printf("graceful shutdown error: %v", err)
		}
	}
}
