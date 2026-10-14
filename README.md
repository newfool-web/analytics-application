# CausalFunnel Analytics

Full-stack user analytics application with:

- A React dashboard for sessions and click heatmaps.
- A standalone `tracker.js` script for collecting page views and clicks.
- An Express API for event validation and storage.
- MongoDB persistence through Mongoose.
- Docker Compose support for development.
- Separate Vercel deployments for the frontend and serverless API.

## Setup steps

### Prerequisites

- Git
- Docker Desktop with Docker Compose
- A MongoDB Atlas cluster, or another reachable MongoDB deployment

The application does not start a local MongoDB container. The API always connects through `MONGODB_URI`.

### 1. Configure MongoDB

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Create or select the `causalfunnel_analytics` database.
4. Allow the machine running Docker to connect to the cluster.
5. Copy the MongoDB connection string.

Example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/causalfunnel_analytics?retryWrites=true&w=majority
```

### 2. Configure environment variables

Create `server/.env` for the API:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/causalfunnel_analytics?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173,http://localhost:8080
NODE_ENV=development
```

Create `client/.env` for local Vite development:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The client environment file contains only `VITE_API_BASE_URL`; that is expected. The frontend only needs the public API URL. Do not put `MONGODB_URI` in the client environment.

Docker Compose reads the API variables from `server/.env`. Its frontend build argument defaults to `http://localhost:5000/api`, so a root `.env` file is not required for the current Docker setup. You may create an optional root `.env` only when you need to override the Compose defaults:

```env
VITE_API_BASE_URL=http://localhost:5000/api
CLIENT_ORIGIN=http://localhost:8080
```

Never commit `.env` files. `VITE_*` variables are public and are embedded into the frontend at build time.

### 3. Development with Docker

From the repository root, build and start both containers:

```powershell
docker compose up --build -d
```

Check the running services:

```powershell
docker compose ps
docker compose logs -f
```

Development URLs:

| Service | URL |
|---|---|
| Dashboard | http://localhost:8080 |
| Demo landing page | http://localhost:8080/demo |
| Demo products page | http://localhost:8080/demo/products |
| Demo features page | http://localhost:8080/demo/features |
| Tracker script | http://localhost:8080/tracker.js |
| API | http://localhost:5000 |
| API health | http://localhost:5000/api/health |

Open `http://localhost:8080/demo`, navigate through the demo pages, and click several elements. Then open the dashboard at `http://localhost:8080` and check **Sessions** and **Heatmap**.

Stop the containers:

```powershell
docker compose down
```

The Compose stack contains:

- `server`: Node.js API on port `5000`.
- `client`: Vite production build served by Nginx on port `8080`.
- MongoDB: external MongoDB Atlas connection.

### 4. Production deployment on Vercel

The production deployment uses two Vercel projects:

1. `client` as the frontend project.
2. `server` as the serverless API project.

#### API project

Create a Vercel project with:

```text
Root Directory: server
Framework Preset: Other
Build Command: npm install
Output Directory: leave empty
```

The API entry point is `server/api/index.js`. It connects to MongoDB and forwards requests to the Express app in `server/src/app.js`.

Set these environment variables in the API Vercel project:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/causalfunnel_analytics?retryWrites=true&w=majority
NODE_ENV=production
CLIENT_ORIGIN=https://analytics-application-client.vercel.app
```

Do not set `PORT` on Vercel.

After deployment, verify:

```text
https://analytics-application-api.vercel.app/api/health
```

Expected response:

```json
{
  "status": "ok",
  "db": "connected"
}
```

#### Frontend project

Create a second Vercel project with:

```text
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Set this environment variable in the frontend Vercel project:

```env
VITE_API_BASE_URL=https://analytics-application-api.vercel.app/api
```

Redeploy the frontend whenever `VITE_API_BASE_URL` changes because Vite embeds it during the build.

Production URLs:

| Page | URL |
|---|---|
| Dashboard | https://analytics-application-client.vercel.app/ |
| Demo landing page | https://analytics-application-client.vercel.app/demo |
| Demo products page | https://analytics-application-client.vercel.app/demo/products |
| Demo features page | https://analytics-application-client.vercel.app/demo/features |
| Tracker script | https://analytics-application-client.vercel.app/tracker.js |
| API health | https://analytics-application-api.vercel.app/api/health |

The frontend uses `client/vercel.json` to rewrite React routes to `index.html`, so direct navigation to `/demo`, `/demo/products`, and `/demo/features` works.

### 5. Embed the tracker

Use the tracker on another website with:

```text
&lt;script
  src="https://analytics-application-client.vercel.app/tracker.js"
  data-api-url="https://analytics-application-api.vercel.app/api"
  defer
&gt;&lt;/script&gt;
```

For the Docker development environment:

```text
&lt;script
  src="http://localhost:8080/tracker.js"
  data-api-url="http://localhost:5000/api"
  defer
&gt;&lt;/script&gt;
```

The script requires `data-api-url`. It stores a session identifier in `localStorage`, sends a `page_view`, sends click events, and removes URL hash fragments before storing page URLs.

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19 |
| Frontend build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Tracker | Vanilla JavaScript |
| Backend | Node.js 22, Express 4 |
| Database access | Mongoose 8 |
| Database | MongoDB Atlas |
| Development deployment | Docker, Docker Compose |
| Frontend web server | Nginx in the client image |
| Production frontend | Vercel |
| Production API | Vercel Node.js serverless function |

## API

All API routes are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/events` | Validate and store one event |
| `GET` | `/api/sessions` | Return sessions ordered by recent activity |
| `GET` | `/api/sessions/:sessionId/events` | Return events for one session |
| `GET` | `/api/heatmap/pages` | Return pages with recorded clicks |
| `GET` | `/api/heatmap/clicks?pageUrl=` | Return click points for a page |
| `GET` | `/api/health` | Return API and MongoDB connection status |

Example event:

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

## Assumptions or trade-offs

### Tracking and heatmap

- Coordinates use `clientX` and `clientY`, so they are viewport-relative.
- The viewport dimensions are not stored. The heatmap visualisation assumes a `1920x1080` viewport and clamps points to the display bounds.
- A session is identified by `localStorage`. Clearing storage, using another browser, or using another origin creates a new session.
- If `localStorage` is unavailable, the tracker generates a non-persistent identifier.
- Events use `fetch` with `keepalive`; delivery failures do not break the host website.
- URL hash fragments are removed from `page_url`.

### Backend and data

- There is no authentication or user-management system; this keeps the assessment application simple but is not suitable for protected analytics data.
- Event ingestion is intentionally available from any origin so the tracker can be embedded on third-party websites.
- Dashboard data is read from one MongoDB `events` collection; this is simple to understand and sufficient for the current application size.
- There is no pagination for the session list, which keeps the UI and API straightforward for a small dataset.
- MongoDB connections are cached for warm Vercel serverless invocations to reduce unnecessary connection creation.

### Deployment

- Docker Compose is the development and self-hosted deployment path; MongoDB remains external.
- Vercel production uses separate frontend and API projects because the API runs as a serverless function.
- Vercel does not provide one fixed outbound IP for serverless functions. MongoDB Atlas network access must allow Vercel connections; use the narrowest practical policy for the deployment.
- `VITE_API_BASE_URL` is public and build-time only. It must contain the deployed API URL, including `/api`.
- The repository has no automated test suite. Verification is performed through the API health endpoint, demo navigation, event collection, Sessions, and Heatmap views.
- The frontend and API currently use separate Vercel domains. Custom domains can be added later, but both `VITE_API_BASE_URL` and `CLIENT_ORIGIN` must then be updated and redeployed.

## Verification checklist

1. Open the API health URL and confirm `"status": "ok"` and `"db": "connected"`.
2. Open the production demo page.
3. Visit `/demo/products` and `/demo/features`.
4. Click several elements.
5. Open the production dashboard.
6. Confirm the new session appears in **Sessions**.
7. Confirm click data appears in **Heatmap**.
8. Confirm the tracker is available at `/tracker.js`.
