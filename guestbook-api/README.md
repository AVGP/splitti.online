# Splitti Guestbook Backend

A lightweight Go + SQLite JSON API for the `splitti.online` guestbook app, designed to be served at `https://guestbook.splitti.online` via Docker.

## API

### `GET /entries?page=1` (also available at `GET /?page=1`)
Returns a page of up to 5 newest guestbook entries (email addresses are stored in SQLite but never exposed publicly).

```json
{
  "entries": [
    {
      "id": 12,
      "name": "Alice",
      "text": "Awesome Windows 98 site!",
      "created_at": "2026-11-27T14:30:00Z"
    }
  ],
  "page": 1,
  "per_page": 5,
  "total_entries": 12,
  "total_pages": 3,
  "has_prev": false,
  "has_next": true
}
```

### `POST /entries` (also available at `POST /`)
Creates a new guestbook entry.

Request JSON:
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "text": "Awesome Windows 98 site!"
}
```

Validation:
- `name`: required, plaintext, max 80 characters
- `email`: required, valid email address, max 254 characters
- `text`: required, plaintext, max 300 characters

### `GET /healthz`
Returns `200 OK` with `{"status":"ok"}` when the server and SQLite database are healthy.

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8080` | HTTP listen port |
| `DB_PATH` | `./data/guestbook.db` (`/data/guestbook.db` in Docker) | Path to the SQLite database file |
| `ALLOWED_ORIGINS` | `https://splitti.online,https://www.splitti.online,http://localhost:8080` | Comma-separated CORS origins (or `*`) |
| `RATE_LIMIT_PER_MIN` | `10` | Max POST submissions per IP per minute (`0` to disable) |

## Docker Deployment

```bash
cd guestbook
docker compose up -d --build
```

SQLite data is persisted in the named Docker volume `guestbook_data` mounted at `/data`. Place a reverse proxy (Caddy, Nginx, Traefik, etc.) in front of `127.0.0.1:8080` for TLS termination at `https://guestbook.splitti.online`.

## Local Development

```bash
cd guestbook
go test -v ./...
ALLOWED_ORIGINS="*" go run .
```
