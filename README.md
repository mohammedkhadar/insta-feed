# Bowatt Challenge

A photo upload and feed app with a Go backend and React/Vite frontend. Live feed updates via WebSocket.

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
