# Have I Played With?

A web app that lets League of Legends players check if they've shared a ranked game with another player. Search your match history, see full stat lines, and discover who you play with most often.

## Features

- **Played With?** — Enter two Riot IDs and find every ranked game they've shared. Results stream in real-time with a progress bar.
- **Common Players** — Enter one Riot ID and see who they've played with 3+ times in the current ranked season.
- **Full match detail** — Expandable match cards with KDA, CS, damage, gold, vision score, items, and all 10 players per game.
- **Light/Dark mode** — Toggle in the top-right corner, auto-detects system preference.
- **PWA** — Installable on mobile and desktop. DDragon assets (champion/item icons) are cached offline.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Material UI 6, Vite |
| Backend | Node.js, Express, TypeScript |
| API | Riot Games API (Account v1, Match v5) |
| PWA | vite-plugin-pwa, Workbox |
| Package Manager | pnpm (workspaces) |

## Architecture

```
React PWA (Vite)  <--->  Express API Server  <--->  Riot Games API
     :5173                    :3001                Rate Limited + Cached
```

The Riot API key stays server-side. The Express server handles rate limiting (20 req/s, 100 req/2min token buckets), caches match data in memory, and streams search progress to the client via Server-Sent Events (SSE).

## Quick Start

```bash
# Prerequisites: Node 22+, pnpm
nvm use           # uses .nvmrc
pnpm install

# Add your Riot API key
cp server/.env.example server/.env
# Edit server/.env and set RIOT_API_KEY

# Start both client and server in dev mode
pnpm dev
```

The client runs at `http://localhost:5173` and proxies API requests to the server on port 3001.

## Deployment

### Docker

```bash
docker build -t have-i-played-with .
docker run -p 3001:3001 \
  -e RIOT_API_KEY=your-key \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  have-i-played-with
```

### Manual

```bash
pnpm build
NODE_ENV=production RIOT_API_KEY=your-key node server/dist/index.js
```

In production, the Express server serves the client build from `client/dist` on the same port.

## Riot API Key

This app requires a [Riot Games API key](https://developer.riotgames.com/). Development keys are rate-limited and expire every 24 hours. For a persistent deployment, apply for a personal or production key.

## Search Modes

### Played With?

1. Resolves both players' PUUIDs from their Riot IDs
2. Fetches the first player's ranked match history (paginated)
3. Checks each match's participant list for the target player
4. Streams matches found back to the client as they're discovered

**History depth options:**
- **Current Season** — from season start date onward
- **Last Year** — past 365 days
- **All History** — no time filter (slowest)

### Common Players

1. Fetches all current season ranked matches for the player
2. Counts how many games each co-participant appears in
3. Returns players with 3+ shared games, sorted by frequency

## Supported Regions

NA, EUW, EUNE, KR, JP, BR, LAN, LAS, OCE, TR, RU

## License

MIT
