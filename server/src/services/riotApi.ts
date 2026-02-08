import { rateLimiter } from "../middleware/rateLimiter";
import {
  Platform,
  RegionalRoute,
  PLATFORM_TO_REGION,
  RiotAccount,
  MatchData,
} from "../types";

const API_KEY = process.env.RIOT_API_KEY || "";

const MAX_CACHE_SIZE = 5000;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: unknown; expires: number }>();

function pruneCache(): void {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const now = Date.now();
  // First pass: remove expired
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key);
  }
  // If still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = [...cache.entries()].sort((a, b) => a[1].expires - b[1].expires);
    const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    for (const [key] of toRemove) cache.delete(key);
  }
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  pruneCache();
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

async function riotFetch<T>(url: string, cacheKey?: string): Promise<T> {
  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  await rateLimiter.waitForToken();

  const res = await fetch(url, {
    headers: { "X-Riot-Token": API_KEY },
  });

  rateLimiter.handleResponseHeaders(res.headers);

  if (res.status === 429) {
    console.log("[RiotAPI] Rate limited, retrying...");
    return riotFetch<T>(url, cacheKey);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Riot API ${res.status}: ${body}`);
  }

  const data = (await res.json()) as T;
  if (cacheKey) setCache(cacheKey, data);
  return data;
}

function regionalUrl(region: RegionalRoute): string {
  return `https://${region}.api.riotgames.com`;
}

function platformUrl(platform: Platform): string {
  return `https://${platform}.api.riotgames.com`;
}

export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  platform: Platform
): Promise<RiotAccount> {
  const region = PLATFORM_TO_REGION[platform];
  const url = `${regionalUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<RiotAccount>(url, `account:${gameName}#${tagLine}:${region}`);
}

export async function getMatchIds(
  puuid: string,
  platform: Platform,
  options: { startTime?: number; start?: number; count?: number }
): Promise<string[]> {
  const region = PLATFORM_TO_REGION[platform];
  const params = new URLSearchParams();
  params.set("type", "ranked");
  params.set("count", String(options.count || 100));
  if (options.start !== undefined) params.set("start", String(options.start));
  if (options.startTime !== undefined)
    params.set("startTime", String(options.startTime));

  const url = `${regionalUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids?${params}`;
  return riotFetch<string[]>(url);
}

export async function getMatch(
  matchId: string,
  platform: Platform
): Promise<MatchData> {
  const region = PLATFORM_TO_REGION[platform];
  const url = `${regionalUrl(region)}/lol/match/v5/matches/${matchId}`;
  return riotFetch<MatchData>(url, `match:${matchId}`);
}

export { platformUrl, regionalUrl };
