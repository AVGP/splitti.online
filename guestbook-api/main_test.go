package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func newTestServer(t *testing.T) *Server {
	t.Helper()
	db, err := openDB(":memory:")
	if err != nil {
		t.Fatalf("openDB: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return newServer(db, "https://splitti.online,http://localhost:8080", 100)
}

func TestGuestbookCreateAndPagination(t *testing.T) {
	srv := newTestServer(t)
	handler := srv.routes()

	// Empty guestbook returns page 1 with 0 entries
	req := httptest.NewRequest(http.MethodGet, "/entries", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var emptyPage PageResponse
	if err := json.NewDecoder(rec.Body).Decode(&emptyPage); err != nil {
		t.Fatalf("decode empty page: %v", err)
	}
	if emptyPage.TotalEntries != 0 || emptyPage.TotalPages != 1 || len(emptyPage.Entries) != 0 {
		t.Fatalf("unexpected empty page: %+v", emptyPage)
	}

	// Insert 7 entries
	for i := 1; i <= 7; i++ {
		payload := CreateEntryRequest{
			Name:  fmt.Sprintf("Visitor %d", i),
			Email: fmt.Sprintf("visitor%d@example.com", i),
			Text:  fmt.Sprintf("Hello from visitor #%d!", i),
		}
		body, _ := json.Marshal(payload)
		postReq := httptest.NewRequest(http.MethodPost, "/entries", bytes.NewReader(body))
		postReq.Header.Set("Content-Type", "application/json")
		postRec := httptest.NewRecorder()
		handler.ServeHTTP(postRec, postReq)

		if postRec.Code != http.StatusCreated {
			t.Fatalf("entry %d: expected 201, got %d: %s", i, postRec.Code, postRec.Body.String())
		}
		// Ensure email is never leaked in response JSON
		if strings.Contains(postRec.Body.String(), "example.com") {
			t.Fatalf("email leaked in POST response: %s", postRec.Body.String())
		}
	}

	// Page 1 should have 5 newest entries (7 down to 3)
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, httptest.NewRequest(http.MethodGet, "/entries?page=1", nil))
	if rec1.Code != http.StatusOK {
		t.Fatalf("page 1: expected 200, got %d", rec1.Code)
	}
	var page1 PageResponse
	if err := json.NewDecoder(rec1.Body).Decode(&page1); err != nil {
		t.Fatalf("decode page 1: %v", err)
	}
	if len(page1.Entries) != 5 || page1.TotalEntries != 7 || page1.TotalPages != 2 || page1.HasPrev || !page1.HasNext {
		t.Fatalf("unexpected page 1 metadata: %+v", page1)
	}
	if page1.Entries[0].Name != "Visitor 7" || page1.Entries[4].Name != "Visitor 3" {
		t.Fatalf("unexpected page 1 order: first=%s last=%s", page1.Entries[0].Name, page1.Entries[4].Name)
	}

	// Page 2 should have remaining 2 entries (2 down to 1)
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, httptest.NewRequest(http.MethodGet, "/?page=2", nil))
	if rec2.Code != http.StatusOK {
		t.Fatalf("page 2: expected 200, got %d", rec2.Code)
	}
	var page2 PageResponse
	if err := json.NewDecoder(rec2.Body).Decode(&page2); err != nil {
		t.Fatalf("decode page 2: %v", err)
	}
	if len(page2.Entries) != 2 || !page2.HasPrev || page2.HasNext {
		t.Fatalf("unexpected page 2: %+v", page2)
	}
	if page2.Entries[0].Name != "Visitor 2" || page2.Entries[1].Name != "Visitor 1" {
		t.Fatalf("unexpected page 2 order: %+v", page2.Entries)
	}
}

func TestValidationAnd300CharLimit(t *testing.T) {
	srv := newTestServer(t)
	handler := srv.routes()

	// Exactly 300 Unicode runes should succeed
	okText := strings.Repeat("ä", 300)
	body, _ := json.Marshal(CreateEntryRequest{
		Name:  "Martin",
		Email: "martin@splitti.online",
		Text:  okText,
	})
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/entries", bytes.NewReader(body)))
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 300-char text to succeed, got %d: %s", rec.Code, rec.Body.String())
	}

	// 301 Unicode runes should fail with 400
	tooLong := strings.Repeat("ä", 301)
	body, _ = json.Marshal(CreateEntryRequest{
		Name:  "Martin",
		Email: "martin@splitti.online",
		Text:  tooLong,
	})
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/entries", bytes.NewReader(body)))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 301-char text to fail with 400, got %d", rec.Code)
	}

	// Invalid email should fail with 400
	body, _ = json.Marshal(CreateEntryRequest{
		Name:  "Martin",
		Email: "not-an-email",
		Text:  "Hello!",
	})
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/entries", bytes.NewReader(body)))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected invalid email to fail with 400, got %d", rec.Code)
	}
}

func TestCORSAndHealthcheck(t *testing.T) {
	srv := newTestServer(t)
	handler := srv.routes()

	req := httptest.NewRequest(http.MethodOptions, "/entries", nil)
	req.Header.Set("Origin", "https://splitti.online")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 for OPTIONS, got %d", rec.Code)
	}
	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "https://splitti.online" {
		t.Fatalf("expected CORS origin https://splitti.online, got %q", got)
	}

	healthRec := httptest.NewRecorder()
	handler.ServeHTTP(healthRec, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if healthRec.Code != http.StatusOK {
		t.Fatalf("expected 200 for /healthz, got %d", healthRec.Code)
	}
}
