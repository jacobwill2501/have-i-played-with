# Development Guide

## Prerequisites

- **Node.js 22+** (see `.nvmrc`)
- **pnpm** — `corepack enable pnpm`
- **Riot API key** — [developer.riotgames.com](https://developer.riotgames.com/)

## Project Structure

```
have-i-played-with/
├── client/                     # React PWA (Vite + TypeScript)
│   ├── public/                 # Static assets (SVG icons)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── SearchForm.tsx          # Two-tab search form (Played With / Common Players)
│   │   │   ├── SearchProgress.tsx      # Progress bar during search
│   │   │   ├── ResultsDisplay.tsx      # Match history cards with full stat lines
│   │   │   ├── CommonPlayersDisplay.tsx # Grid of common players with dialog detail
│   │   │   └── RegionSelect.tsx        # Region dropdown
│   │   ├── hooks/
│   │   │   ├── useSearch.ts            # SSE connection, search state management
│   │   │   ├── useColorMode.ts         # Light/dark theme with localStorage persistence
│   │   │   └── useDDragonVersion.ts    # Fetches latest DDragon version from server
│   │   ├── types.ts            # Shared client types
│   │   ├── App.tsx             # Root component
│   │   └── main.tsx            # Entry point
│   ├── cypress/                # E2E tests
│   ├── vite.config.ts
│   └── package.json
├── server/                     # Express API (TypeScript)
│   ├── src/
│   │   ├── index.ts            # Express app entry, static serving, graceful shutdown
│   │   ├── routes/
│   │   │   └── search.ts       # SSE endpoints: /api/search, /api/common-players, /api/ddragon-version
│   │   ├── services/
│   │   │   ├── riotApi.ts      # Riot API client with rate limiting + caching
│   │   │   ├── matchSearch.ts  # "Played With?" search orchestration
│   │   │   └── commonPlayers.ts # "Common Players" search orchestration
│   │   ├── middleware/
│   │   │   └── rateLimiter.ts  # Token bucket rate limiter (dual window)
│   │   └── types.ts            # Server types, Riot API types, region mappings
│   ├── .env.example
│   └── package.json
├── Dockerfile
├── package.json                # Root workspace config
└── pnpm-workspace.yaml
```

## Setup

```bash
nvm use
pnpm install
cp server/.env.example server/.env
# Edit server/.env — set RIOT_API_KEY to your development key
```

## Running in Development

```bash
pnpm dev
```

This starts both services concurrently:
- **Client**: Vite dev server on `http://localhost:5173` with HMR
- **Server**: `tsx watch` on `http://localhost:3001` with auto-reload on file changes

The Vite dev server proxies `/api/*` requests to the Express server (configured in `client/vite.config.ts`).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start client + server in dev mode |
| `pnpm build` | Build both server (tsc) and client (vite build) |
| `pnpm start` | Run production server (serves client build) |
| `pnpm lint` | Lint both client and server with ESLint |

## API Endpoints

All endpoints are under `/api`:

### `GET /api/search`

Search for shared ranked games between two players. Returns SSE stream.

**Query params:**
| Param | Example | Description |
|-------|---------|-------------|
| `player` | `Faker#NA1` | First player's Riot ID (Name#Tag) |
| `target` | `Hide on bush#NA1` | Second player's Riot ID |
| `region` | `na1` | Platform routing value |
| `depth` | `season` | `season`, `year`, or `all` |

**SSE events:**
- `progress` — `{ searched, total, percent }`
- `match` — Full match result object (when a shared game is found)
- `done` — `{ totalMatches, totalSearched }`
- `error` — `{ message }`

### `GET /api/common-players`

Find players you've played with 3+ times in the current season. Returns SSE stream.

**Query params:**
| Param | Example | Description |
|-------|---------|-------------|
| `player` | `Faker#NA1` | Player's Riot ID |
| `region` | `na1` | Platform routing value |

**SSE events:**
- `progress` — `{ searched, total, percent }`
- `result` — Array of common player objects
- `done` — `{}`
- `error` — `{ message }`

### `GET /api/ddragon-version`

Returns the latest DDragon version for champion/item assets.

**Response:** `{ "version": "15.1.1" }`

### `GET /api/health`

Health check endpoint.

**Response:** `{ "status": "ok", "timestamp": "..." }`

## Riot API Details

### Rate Limiting

The server uses a dual-window token bucket (`server/src/middleware/rateLimiter.ts`):
- **20 requests per 1 second**
- **100 requests per 2 minutes**

API calls queue up and wait for available tokens. The limiter also reads `X-App-Rate-Limit-Count` headers from Riot responses and backs off dynamically. On `429` responses, it pauses for the `Retry-After` duration.

### Region Routing

Riot's API uses two routing concepts:

| Platform (match lists, summoner data) | Regional (account lookup, match data) |
|---------------------------------------|---------------------------------------|
| `na1`, `br1`, `la1`, `la2`, `oc1` | `americas` |
| `euw1`, `eune1`, `tr1`, `ru` | `europe` |
| `kr`, `jp1` | `asia` |
| `ph2`, `sg2`, `th2`, `tw2`, `vn2` | `sea` |

The mapping is defined in `server/src/types.ts` (`PLATFORM_TO_REGION`).

### Caching

Match data is cached in-memory with a 10-minute TTL. The cache is capped at 5000 entries — when full, expired entries are pruned first, then the oldest entries are evicted.

## Testing

### Cypress E2E

```bash
# Start dev servers first
pnpm dev

# In another terminal
cd client
npx cypress open    # Interactive mode
npx cypress run     # Headless mode
```

Test files:
- `cypress/e2e/search-form.cy.ts` — Form rendering, validation, input behavior
- `cypress/e2e/search-flow.cy.ts` — SSE flow mocking, progress display, results rendering

## Building for Production

```bash
pnpm build
```

This runs `tsc` for the server and `tsc -b && vite build` for the client. Output:
- `server/dist/` — Compiled server JavaScript
- `client/dist/` — Optimized client bundle with PWA service worker

Code splitting produces three chunks:
- `vendor` — React, React DOM
- `mui` — Material UI
- `index` — Application code

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RIOT_API_KEY` | Yes | — | Riot Games API key |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | — | Set to `production` for prod mode |
| `ALLOWED_ORIGINS` | No | — | Comma-separated allowed CORS origins (production only) |
| `VITE_API_URL` | No | `""` | Client API base URL (empty = same origin / Vite proxy) |

## Common Issues

**"RIOT_API_KEY environment variable is required"**
Copy `.env.example` to `.env` and add your key.

**Development key expired**
Riot development keys expire every 24 hours. Regenerate at [developer.riotgames.com](https://developer.riotgames.com/).

**Rate limit errors during large searches**
The token bucket handles this automatically, but "All History" searches on active accounts can take a while. The progress bar reflects real-time status.

**Empty search results**
The app only searches ranked games (Solo/Duo queue ID 420, Flex queue ID 440). Normal/ARAM games are excluded.
