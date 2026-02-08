import { getAccountByRiotId, getMatchIds, getMatch } from "./riotApi";
import {
  Platform,
  MatchResult,
  ProgressEvent,
  MatchData,
  ParticipantStats,
} from "../types";

const RANKED_QUEUES = new Set([420, 440]);
const MIN_GAMES_THRESHOLD = 3;

interface CommonPlayerResult {
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string;
  gamesPlayed: number;
  matches: MatchResult[];
}

interface CommonPlayersCallbacks {
  onProgress: (event: ProgressEvent) => void;
  onResult: (players: CommonPlayerResult[]) => void;
  onError: (error: string) => void;
  onDone: () => void;
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

export async function findCommonPlayers(
  playerName: string,
  playerTag: string,
  platform: Platform,
  callbacks: CommonPlayersCallbacks
): Promise<void> {
  try {
    const playerAccount = await getAccountByRiotId(playerName, playerTag, platform);

    // Current season only
    const seasonStart = new Date("2026-01-08T00:00:00Z");
    const startTime = Math.floor(seasonStart.getTime() / 1000);

    // Fetch all match IDs
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
      callbacks.onResult([]);
      callbacks.onDone();
      return;
    }

    const total = allMatchIds.length;
    let searched = 0;

    // Track player occurrences: puuid -> { info, matches }
    const playerMap = new Map<
      string,
      {
        riotIdGameName: string;
        riotIdTagline: string;
        matches: MatchResult[];
      }
    >();

    for (const matchId of allMatchIds) {
      try {
        const match = await getMatch(matchId, platform);
        const { info, metadata } = match;

        if (!RANKED_QUEUES.has(info.queueId)) {
          searched++;
          callbacks.onProgress({
            searched,
            total,
            percent: Math.round((searched / total) * 100),
          });
          continue;
        }

        const matchResult: MatchResult = {
          matchId: metadata.matchId,
          gameCreation: info.gameCreation,
          gameDuration: info.gameDuration,
          queueType: info.queueId === 420 ? "Solo/Duo" : "Flex",
          playerPuuid: playerAccount.puuid,
          targetPuuid: "", // Will be set per common player
          participants: info.participants.map(extractParticipantStats),
        };

        for (const participant of info.participants) {
          if (participant.puuid === playerAccount.puuid) continue;

          const existing = playerMap.get(participant.puuid);
          if (existing) {
            existing.matches.push({
              ...matchResult,
              targetPuuid: participant.puuid,
            });
          } else {
            playerMap.set(participant.puuid, {
              riotIdGameName: participant.riotIdGameName,
              riotIdTagline: participant.riotIdTagline,
              matches: [{ ...matchResult, targetPuuid: participant.puuid }],
            });
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

    // Filter to players with >= threshold games and sort by count descending
    const commonPlayers: CommonPlayerResult[] = [];
    for (const [puuid, data] of playerMap) {
      if (data.matches.length >= MIN_GAMES_THRESHOLD) {
        commonPlayers.push({
          puuid,
          riotIdGameName: data.riotIdGameName,
          riotIdTagline: data.riotIdTagline,
          gamesPlayed: data.matches.length,
          matches: data.matches,
        });
      }
    }

    commonPlayers.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    callbacks.onResult(commonPlayers);
    callbacks.onDone();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    callbacks.onError(message);
  }
}
