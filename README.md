# Bowatt Challenge

A photo upload and feed app with a Go backend and React/Vite frontend. Live feed updates via WebSocket.

## Architecture

```
frontend (Vite/React)          backend (Go)
        |                            |
        |  REST  GET /api/pictures   |
        |--------------------------->|
        |                            |--- BoltDB (metadata: filename, title, tag)
        |  REST  POST /api/upload    |--- ./pictures/ (image files on disk)
        |--------------------------->|
        |                            |
        |  WebSocket  /ws            |
        |<-------------------------->|
        |   (live new_photo events)  |
```

- **Frontend** — React SPA served by Vite. On load it fetches all photos from the REST API. A persistent WebSocket connection to `/ws` receives `new_photo` events whenever any client uploads, instantly updating all open feeds without polling.
- **Backend** — Single Go binary with no external framework. Handlers are split one-per-file under `handlers/`. A thread-safe hub manages all active WebSocket connections and broadcasts to them on upload.
- **Storage** — Image files are written to `./pictures/` on disk. Metadata (filename, title, tag) is persisted in BoltDB, an embedded key/value store — no separate database process required.
- **Tag filtering** — The `?tag=` query param is handled server-side; the frontend re-fetches from the API when a tag filter is selected.

## Requirements

- Go 1.21+
- Node.js 18+

## Backend

```bash
cd backend
go run .
```

The server starts at `http://localhost:8080`.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pictures` | List photos (supports `?tag=` and `?page=`, `?per_page=`) |
| POST | `/api/upload` | Upload a photo (multipart: `photo`, `title`, `tag`) |
| GET | `/pictures/<filename>` | Serve uploaded images |
| GET | `/ws` | WebSocket connection for live feed updates |

> If you see `failed to open BoltDB: timeout`, a previous server instance is still running. Kill it with:
> ```bash
> lsof -ti:8080 | xargs kill -9
> ```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies API and WebSocket requests to the backend.

## Running Both Together

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && go run .

# Terminal 2 — frontend
cd frontend && npm run dev
```

Then open `http://localhost:5173` in your browser.
