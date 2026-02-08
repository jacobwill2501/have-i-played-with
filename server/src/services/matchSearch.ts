import { getAccountByRiotId, getMatchIds, getMatch } from "./riotApi";
import {
  Platform,
  SearchDepth,
  MatchResult,
  ProgressEvent,
  MatchData,
  ParticipantStats,
} from "../types";

const RANKED_QUEUES = new Set([420, 440]); // Solo/Duo, Flex

function getStartTime(depth: SearchDepth): number | undefined {
  const now = Math.floor(Date.now() / 1000);
  switch (depth) {
    case "season": {
      const seasonStart = new Date("2026-01-08T00:00:00Z");
      return Math.floor(seasonStart.getTime() / 1000);
    }
    case "year":
      return now - 365 * 24 * 60 * 60;
    case "all":
      return undefined;
  }
}

interface SearchCallbacks {
  onProgress: (event: ProgressEvent) => void;
  onMatch: (match: MatchResult) => void;
  onError: (error: string) => void;
  onDone: (totalMatches: number, totalSearched: number) => void;
}

function extractParticipantStats(p: MatchData["info"]["participants"][0]): ParticipantStats {
  return {
    puuid: p.puuid,
    summonerName: p.summonerName,
    riotIdGameName: p.riotIdGameName,
    riotIdTagline: p.riotIdTagline,
    championName: p.championName,
    championId: p.championId,
    teamId: p.teamId,
    win: p.win,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    totalMinionsKilled: p.totalMinionsKilled,
    neutralMinionsKilled: p.neutralMinionsKilled,
    goldEarned: p.goldEarned,
    totalDamageDealtToChampions: p.totalDamageDealtToChampions,
    wardsPlaced: p.wardsPlaced,
    wardsKilled: p.wardsKilled,
    visionScore: p.visionScore,
    champLevel: p.champLevel,
    item0: p.item0,
    item1: p.item1,
    item2: p.item2,
    item3: p.item3,
    item4: p.item4,
    item5: p.item5,
    item6: p.item6,
    summoner1Id: p.summoner1Id,
    summoner2Id: p.summoner2Id,
  };
}

function extractMatchResult(
  match: MatchData,
  playerPuuid: string,
  targetPuuid: string
): MatchResult | null {
  const { info, metadata } = match;

  if (!RANKED_QUEUES.has(info.queueId)) return null;

  const hasPlayer = info.participants.some((p) => p.puuid === playerPuuid);
  const hasTarget = info.participants.some((p) => p.puuid === targetPuuid);

  if (!hasPlayer || !hasTarget) return null;

  return {
    matchId: metadata.matchId,
    gameCreation: info.gameCreation,
    gameDuration: info.gameDuration,
    queueType: info.queueId === 420 ? "Solo/Duo" : "Flex",
    playerPuuid,
    targetPuuid,
    participants: info.participants.map(extractParticipantStats),
  };
}

export async function searchMatches(
  playerName: string,
  playerTag: string,
  targetName: string,
  targetTag: string,
  platform: Platform,
  depth: SearchDepth,
  callbacks: SearchCallbacks
): Promise<void> {
  try {
    const [playerAccount, targetAccount] = await Promise.all([
      getAccountByRiotId(playerName, playerTag, platform),
      getAccountByRiotId(targetName, targetTag, platform),
    ]);

    const startTime = getStartTime(depth);

    // Fetch all match IDs by paginating
    const allMatchIds: string[] = [];
    let start = 0;
    const pageSize = 100;

    while (true) {
      const ids = await getMatchIds(playerAccount.puuid, platform, {
        startTime,
        start,
        count: pageSize,
      });

      allMatchIds.push(...ids);
      if (ids.length < pageSize) break;
      start += pageSize;
    }

    if (allMatchIds.length === 0) {
      callbacks.onDone(0, 0);
      return;
    }

    const total = allMatchIds.length;
    let searched = 0;
    let matchesFound = 0;

    for (const matchId of allMatchIds) {
      try {
        const match = await getMatch(matchId, platform);

        if (match.metadata.participants.includes(targetAccount.puuid)) {
          const result = extractMatchResult(
            match,
            playerAccount.puuid,
            targetAccount.puuid
          );
          if (result) {
            matchesFound++;
            callbacks.onMatch(result);
          }
        }
      } catch (err) {
        console.error(`Error fetching match ${matchId}:`, err);
      }

      searched++;
      callbacks.onProgress({
        searched,
        total,
        percent: Math.round((searched / total) * 100),
      });
    }

    callbacks.onDone(matchesFound, searched);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callbacks.onError(message);
  }
}
