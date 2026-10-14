# CausalFunnel Analytics

Full-stack user analytics app for the CausalFunnel Full Stack Engineer assessment.

A standalone `tracker.js` records page views and clicks on any webpage, the Express API stores events in MongoDB, and a React dashboard shows session journeys plus a click heatmap.

---

## Tech stack

| Layer | Technology |
|---|---|
| Dashboard | React 19, Vite 6, Tailwind CSS v4 |
| Tracking | Vanilla `tracker.js` (no framework) |
| API | Node.js 22, Express 4, Mongoose 8 |
| Database | MongoDB (Atlas or any MongoDB URI) |
| Containers | Docker, Docker Compose, Nginx (frontend image) |

**Runtime:** Node.js ≥ 18 (Docker images use Node 22). npm ≥ 9.

---

## What the app does today

1. Load a page that includes `tracker.js` (or open a demo route).
2. The script creates or reuses a session ID in `localStorage`, posts a `page_view`, then posts a `click` for each click with `clientX` / `clientY`.
3. `POST /api/events` validates the payload and writes to the `events` collection.
4. The dashboard lists sessions (aggregated counts), shows chronological events per session, and plots clicks on a canvas sized for a 1920×1080 viewport.

Demo pages are React routes (not a separate static `demo/` folder):

| Route | Purpose |
|---|---|
| `/` | Analytics dashboard (Sessions + Heatmap) |
| `/demo` | Landing demo |
| `/demo/products` | Second URL for multi-page sessions |
| `/demo/features` | Third URL for multi-page sessions |

Each demo page injects `/tracker.js` via `useDemoTracker` and sends events to `VITE_API_BASE_URL`.

---

## Project structure

```
.
├── client/                 # Vite + React dashboard and demo routes
│   ├── public/tracker.js   # Embeddable tracking script
│   ├── src/
│   │   ├── App.jsx         # Dashboard vs /demo* routing
│   │   ├── components/     # Sidebar, sessions, heatmap, demo pages
│   │   └── services/api.js
│   ├── Dockerfile          # Multi-stage: Vite build → Nginx
│   └── nginx.conf          # SPA fallback; tracker.js served as a file
├── server/                 # Express API
│   ├── src/
│   │   ├── config/         # env + MongoDB
│   │   ├── controllers/
│   │   ├── middleware/     # validation + error handler
│   │   ├── models/Event.js
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   └── Dockerfile
├── docker-compose.yml      # API on :5000, dashboard on :8080
├── package.json            # convenience scripts (Windows npm.cmd)
└── README.md
```

There is **no** automated test suite in this repo. There is **no** local MongoDB container; the API always uses `MONGODB_URI` (typically Atlas).

---

## Setup steps

### 1. Prerequisites

- Node.js 18+ and npm
- Git
- A MongoDB connection string (Atlas M0 is enough)
- Docker Desktop only if you want the Compose stack

### 2. MongoDB

1. Create a cluster (Atlas free tier is fine).
2. Create a database user.
3. Allow your IP (or `0.0.0.0/0` for local/dev).
4. Copy the URI and include a database name, for example:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/causalfunnel_analytics?retryWrites=true&w=majority
```

Keep this in `server/.env`. Do not commit `.env` files (they are gitignored).

### 3. Environment files

**`server/.env`**

| Variable | Required | Default | Role |
|---|---|---|---|
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `PORT` | No | `5000` | API listen port |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Comma-separated origins (see trade-offs) |
| `NODE_ENV` | No | `development` | `development` includes error messages in 500s |

**`client/.env`**

| Variable | Required | Default | Role |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Browser-facing API base (baked in at Vite build time) |

Example:

```env
# server/.env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/causalfunnel_analytics?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173,http://localhost:8080
NODE_ENV=development
```

```env
# client/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_*` values are public. Never put the Mongo URI in the frontend env.

### 4. Local development (no Docker)

From the repo root:

```bash
npm run install:all
```

Or install each app:

```bash
cd server && npm install
cd ../client && npm install
```

Start the API:

```bash
cd server
npm run dev
# http://localhost:5000  — health: http://localhost:5000/api/health
```

Start the dashboard (second terminal):

```bash
cd client
npm run dev
# http://localhost:5173
```

From the root you can also run `npm run dev:server` and `npm run dev:client` (these wrappers use `npm.cmd`, which is intended for Windows).

Then:

1. Open [http://localhost:5173/demo](http://localhost:5173/demo) and click around; also visit `/demo/products` and `/demo/features`.
2. Open [http://localhost:5173](http://localhost:5173) → **Sessions** for the journey, **Heatmap** for click dots.
3. Confirm [http://localhost:5000/api/health](http://localhost:5000/api/health) returns `{ "status": "ok", "db": "connected" }`.

### 5. Docker Compose

Compose starts **only** the API and the Nginx-served frontend. MongoDB stays on Atlas (or whatever URI is in `server/.env`).

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
docker compose down
```

| Service | URL |
|---|---|
| Dashboard | http://localhost:8080 |
| Demo | http://localhost:8080/demo |
| Tracker | http://localhost:8080/tracker.js |
| API | http://localhost:5000 |
| Health | http://localhost:5000/api/health |

The client image builds with `VITE_API_BASE_URL` (default `http://localhost:5000/api`). That URL must be reachable **from the browser**, not `http://server:5000`. Compose waits until the API healthcheck passes before starting Nginx.

### 6. Embed the tracker on another page

```html
<script
  src="http://localhost:5173/tracker.js"
  data-api-url="http://localhost:5000/api"
  defer
></script>
```

In Docker, use `http://localhost:8080/tracker.js` with the same `data-api-url`.

The script:

- Requires `data-api-url` (otherwise it logs a warning and does nothing)
- Stores `causalfunnel_session_id` in `localStorage` (`crypto.randomUUID()` with a fallback)
- POSTs JSON to `{data-api-url}/events` with `fetch` + `keepalive`
- Listens for clicks in the capture phase
- Strips URL hashes before sending `page_url`
- Never throws into the host page

---

## API

All routes are under `/api`. JSON body limit is 100kb.

| Method | Path | Description |
|---|---|---|
| `POST` | `/events` | Store one event (validated) |
| `GET` | `/sessions` | Sessions with `total_events`, `first_seen`, `last_seen` (newest activity first) |
| `GET` | `/sessions/:sessionId/events` | Events for one session, chronological |
| `GET` | `/heatmap/pages` | Distinct `page_url` values that have clicks |
| `GET` | `/heatmap/clicks?pageUrl=` | Click points for one page (URL-encoded) |
| `GET` | `/health` | `{ status, db }` — `200` connected, `503` disconnected |

**`POST /api/events` body**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "click",
  "page_url": "https://example.com/products",
  "timestamp": "2026-10-14T10:00:00.000Z",
  "click_x": 420,
  "click_y": 280
}
```

Validation:

- `session_id`: non-empty string
- `event_type`: `page_view` or `click`
- `page_url`: valid absolute URL
- `timestamp`: parseable date
- clicks: finite `click_x` and `click_y`
- page views: `click_x` / `click_y` omitted or `null`

Success: `201` `{ "success": true, "event": { ... } }`.

### MongoDB `events` collection

| Field | Type | Notes |
|---|---|---|
| `session_id` | String | required |
| `event_type` | String | `page_view` \| `click` |
| `page_url` | String | required |
| `timestamp` | Date | required |
| `click_x` / `click_y` | Number or null | null for page views |

Indexes: `{ session_id: 1, timestamp: 1 }`, `{ event_type: 1, page_url: 1 }`, `{ session_id: 1 }`.

---

## Assumptions and trade-offs

**Tracking and heatmap**

- Coordinates are viewport-relative (`clientX` / `clientY`), not document coordinates. Scrolled content is not remapped.
- Viewport size is **not** stored (the assignment schema does not include it). The heatmap assumes **1920×1080** and clamps dots to 0–100%. Different screens will not line up pixel-perfectly.
- Session ID lives in `localStorage` until the origin’s storage is cleared. Incognito, another browser, or another origin is a new session. If storage is blocked, a non-persistent UUID is used for that page load only.
- Delivery uses `fetch` with `keepalive` rather than `sendBeacon`, so JSON `Content-Type` works without extra CORS preflight surprises. Failures are swallowed so the host page never breaks.
- Hash fragments are stripped from `page_url`, so in-page hash navigation does not create extra pages.

**Backend**

- No authentication. Dashboard reads are open; `POST /events` is intentionally usable from any origin so the script can sit on third-party sites.
- `CLIENT_ORIGIN` is parsed, but CORS currently **allows all origins** for the same reason. Tightening GET routes later would be a production hardening step.
- One `events` collection; session lists are computed with `$group`. Fine for assessment volume; at scale you would paginate and/or pre-aggregate.
- Session list has no pagination.
- JSON payloads are capped at 100kb.
- Failed Mongo connect exits the process (`process.exit(1)`). Health reports `503` only after a later disconnect.

**Frontend and ops**

- Demo is in-app routes, not a standalone HTML site, so you get multiple distinct `page_url` values without extra hosting.
- Vite embeds `VITE_API_BASE_URL` at **build** time. Changing the API URL for Docker/prod means rebuilding the client image.
- Compose does not run Mongo locally; operators must supply Atlas (or another URI).
- Root `dev:*` / `install:all` scripts call `npm.cmd` (Windows). On macOS/Linux, use `cd server && npm …` / `cd client && npm …`.
- No automated tests in the current tree; verification is manual (demo clicks → dashboard).
- Production-style split (API on Render, dashboard on Vercel) still works: set `MONGODB_URI`, `CLIENT_ORIGIN`, and `VITE_API_BASE_URL`, allow Atlas network access, and rebuild the frontend after changing the API URL. Free-tier hosts may sleep; Atlas M0 is connection-limited.

---

## Quick verification

1. API health returns `db: "connected"`.
2. Demo routes record page views and clicks.
3. Dashboard Sessions shows a session with matching event counts and ordered events.
4. Heatmap lists those demo URLs and draws click dots.
5. Optional: `docker compose up --build -d` and repeat on ports `8080` / `5000`.
