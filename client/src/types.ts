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

export type SearchDepth = "season" | "year" | "all";

export type SearchMode = "played-with" | "common-players";

export interface SearchParams {
  player: string;
  target?: string;
  region: string;
  depth: SearchDepth;
  mode: SearchMode;
}

export type SearchStatus = "idle" | "searching" | "done" | "error";

export interface Region {
  value: string;
  label: string;
}

export const REGIONS: Region[] = [
  { value: "na1", label: "NA" },
  { value: "euw1", label: "EUW" },
  { value: "eune1", label: "EUNE" },
  { value: "kr", label: "KR" },
  { value: "jp1", label: "JP" },
  { value: "br1", label: "BR" },
  { value: "la1", label: "LAN" },
  { value: "la2", label: "LAS" },
  { value: "oc1", label: "OCE" },
  { value: "tr1", label: "TR" },
  { value: "ru", label: "RU" },
];

export interface CommonPlayer {
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string;
  gamesPlayed: number;
  matches: MatchResult[];
}
