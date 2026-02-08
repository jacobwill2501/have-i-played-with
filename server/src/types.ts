export type Platform =
  | "na1"
  | "euw1"
  | "eune1"
  | "kr"
  | "jp1"
  | "br1"
  | "la1"
  | "la2"
  | "oc1"
  | "tr1"
  | "ru"
  | "ph2"
  | "sg2"
  | "th2"
  | "tw2"
  | "vn2";

export type RegionalRoute = "americas" | "europe" | "asia" | "sea";

export const PLATFORM_TO_REGION: Record<Platform, RegionalRoute> = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  euw1: "europe",
  eune1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

export type SearchDepth = "season" | "year" | "all";

export interface ParticipantStats {
  puuid: string;
  summonerName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  championName: string;
  championId: number;
  teamId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionScore: number;
  champLevel: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
}

export interface MatchResult {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueType: string;
  playerPuuid: string;
  targetPuuid: string;
  participants: ParticipantStats[];
}

export interface ProgressEvent {
  searched: number;
  total: number;
  percent: number;
}

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchParticipant {
  puuid: string;
  summonerName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  championName: string;
  championId: number;
  win: boolean;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionScore: number;
  champLevel: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
}

export interface MatchInfo {
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  participants: MatchParticipant[];
}

export interface MatchData {
  metadata: { matchId: string; participants: string[] };
  info: MatchInfo;
}
