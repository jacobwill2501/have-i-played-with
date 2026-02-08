import { Router, Request, Response } from "express";
import { searchMatches } from "../services/matchSearch";
import { findCommonPlayers } from "../services/commonPlayers";
import { Platform, SearchDepth } from "../types";

const router: Router = Router();

const VALID_PLATFORMS: Platform[] = [
  "na1", "euw1", "eune1", "kr", "jp1", "br1",
  "la1", "la2", "oc1", "tr1", "ru",
  "ph2", "sg2", "th2", "tw2", "vn2",
];

const VALID_DEPTHS: SearchDepth[] = ["season", "year", "all"];

function parseRiotId(input: string): { name: string; tag: string } | null {
  const parts = input.split("#");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { name: parts[0], tag: parts[1] };
}

function setupSSE(res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  return (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
}

// Search for games played with a specific player
router.get("/search", (req: Request, res: Response) => {
  const { player, target, region, depth } = req.query;

  if (!player || !target || !region || !depth) {
    res.status(400).json({ error: "Missing required parameters: player, target, region, depth" });
    return;
  }

  const platform = region as Platform;
  if (!VALID_PLATFORMS.includes(platform)) {
    res.status(400).json({ error: `Invalid region: ${region}` });
    return;
  }

  const searchDepth = depth as SearchDepth;
  if (!VALID_DEPTHS.includes(searchDepth)) {
    res.status(400).json({ error: `Invalid depth: ${depth}` });
    return;
  }

  const playerParsed = parseRiotId(player as string);
  const targetParsed = parseRiotId(target as string);

  if (!playerParsed) {
    res.status(400).json({ error: "Invalid player format. Use Name#Tag" });
    return;
  }
  if (!targetParsed) {
    res.status(400).json({ error: "Invalid target format. Use Name#Tag" });
    return;
  }

  const sendEvent = setupSSE(res);

  searchMatches(
    playerParsed.name,
    playerParsed.tag,
    targetParsed.name,
    targetParsed.tag,
    platform,
    searchDepth,
    {
      onProgress: (progress) => sendEvent("progress", progress),
      onMatch: (match) => sendEvent("match", match),
      onError: (error) => sendEvent("error", { message: error }),
      onDone: (totalMatches, totalSearched) => {
        sendEvent("done", { totalMatches, totalSearched });
        res.end();
      },
    }
  );
});

// Find common players (current season, 3+ games)
router.get("/common-players", (req: Request, res: Response) => {
  const { player, region } = req.query;

  if (!player || !region) {
    res.status(400).json({ error: "Missing required parameters: player, region" });
    return;
  }

  const platform = region as Platform;
  if (!VALID_PLATFORMS.includes(platform)) {
    res.status(400).json({ error: `Invalid region: ${region}` });
    return;
  }

  const playerParsed = parseRiotId(player as string);
  if (!playerParsed) {
    res.status(400).json({ error: "Invalid player format. Use Name#Tag" });
    return;
  }

  const sendEvent = setupSSE(res);

  findCommonPlayers(playerParsed.name, playerParsed.tag, platform, {
    onProgress: (progress) => sendEvent("progress", progress),
    onResult: (players) => sendEvent("result", players),
    onError: (error) => sendEvent("error", { message: error }),
    onDone: () => {
      sendEvent("done", {});
      res.end();
    },
  });
});

// Get latest DDragon version
router.get("/ddragon-version", async (_req: Request, res: Response) => {
  try {
    const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = (await response.json()) as string[];
    res.json({ version: versions[0] });
  } catch {
    res.json({ version: "14.24.1" }); // fallback
  }
});

export default router;
