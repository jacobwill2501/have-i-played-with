import {
  Box,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MatchResult, ParticipantStats } from "../types";
import { useDDragonVersion, ddragonBase } from "../hooks/useDDragonVersion";

function championIcon(base: string, name: string) {
  return `${base}/img/champion/${name}.png`;
}

function itemIcon(base: string, itemId: number) {
  if (itemId === 0) return null;
  return `${base}/img/item/${itemId}.png`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCS(p: ParticipantStats): number {
  return p.totalMinionsKilled + p.neutralMinionsKilled;
}

function TeamTable({
  participants,
  teamId,
  playerPuuid,
  targetPuuid,
  ddBase,
}: {
  participants: ParticipantStats[];
  teamId: number;
  playerPuuid: string;
  targetPuuid: string;
  ddBase: string;
}) {
  const teamPlayers = participants.filter((p) => p.teamId === teamId);
  const won = teamPlayers[0]?.win;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: won ? "success.main" : "error.main",
          fontWeight: 700,
          mb: 1,
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {won ? "Victory" : "Defeat"} — {teamId === 100 ? "Blue" : "Red"} Team
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["Player", "Champion", "KDA", "CS", "Damage", "Gold", "Vision", "Items"].map(
                (h) => (
                  <TableCell
                    key={h}
                    align={["Player", "Champion", "Items"].includes(h) ? "left" : "center"}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                      borderBottom: 2,
                      borderColor: "divider",
                      py: 1,
                    }}
                  >
                    {h}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {teamPlayers.map((p) => {
              const isHighlighted =
                p.puuid === playerPuuid || p.puuid === targetPuuid;
              return (
                <TableRow
                  key={p.puuid}
                  sx={{
                    bgcolor: isHighlighted
                      ? "primary.main"
                      : "transparent",
                    "& td": isHighlighted
                      ? { color: "#fff" }
                      : undefined,
                    borderRadius: 2,
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isHighlighted ? 700 : 500,
                        fontSize: "0.8rem",
                        color: isHighlighted ? "#fff" : "text.primary",
                      }}
                    >
                      {p.riotIdGameName}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          fontSize: "0.7rem",
                          color: isHighlighted ? "rgba(255,255,255,0.7)" : "text.secondary",
                          ml: 0.25,
                        }}
                      >
                        #{p.riotIdTagline}
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        component="img"
                        src={championIcon(ddBase, p.championName)}
                        alt={p.championName}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: 2,
                          borderColor: isHighlighted ? "rgba(255,255,255,0.3)" : "divider",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          color: isHighlighted ? "#fff" : "text.primary",
                        }}
                      >
                        {p.championName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: isHighlighted ? "#fff" : "text.primary",
                      }}
                    >
                      {p.kills}/{p.deaths}/{p.assists}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {formatCS(p)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {(p.totalDamageDealtToChampions / 1000).toFixed(1)}k
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {(p.goldEarned / 1000).toFixed(1)}k
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {p.visionScore}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map(
                        (item, i) => {
                          const src = itemIcon(ddBase, item);
                          return src ? (
                            <Box
                              key={i}
                              component="img"
                              src={src}
                              alt={`item ${item}`}
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                border: 1,
                                borderColor: isHighlighted ? "rgba(255,255,255,0.2)" : "divider",
                              }}
                            />
                          ) : (
                            <Box
                              key={i}
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                bgcolor: isHighlighted ? "rgba(255,255,255,0.1)" : "action.hover",
                                border: 1,
                                borderColor: isHighlighted ? "rgba(255,255,255,0.1)" : "divider",
                              }}
                            />
                          );
                        }
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function MatchCard({ match, ddBase }: { match: MatchResult; ddBase: string }) {
  const player = match.participants.find(
    (p) => p.puuid === match.playerPuuid
  );
  const target = match.participants.find(
    (p) => p.puuid === match.targetPuuid
  );
  const sameTeam = player && target && player.teamId === target.teamId;

  return (
    <Accordion
      sx={{
        borderRadius: "14px !important",
        overflow: "hidden",
        borderLeft: 4,
        borderLeftColor: player?.win ? "success.main" : "error.main",
        mb: 1.5,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ py: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={player?.win ? "WIN" : "LOSS"}
            size="small"
            sx={{
              bgcolor: player?.win ? "success.light" : "error.light",
              color: player?.win ? "success.main" : "error.main",
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {player && (
              <Box
                component="img"
                src={championIcon(ddBase, player.championName)}
                alt={player.championName}
                sx={{ width: 32, height: 32, borderRadius: "50%", border: 2, borderColor: "divider" }}
              />
            )}
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {player?.riotIdGameName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
              &
            </Typography>
            {target && (
              <Box
                component="img"
                src={championIcon(ddBase, target.championName)}
                alt={target.championName}
                sx={{ width: 32, height: 32, borderRadius: "50%", border: 2, borderColor: "divider" }}
              />
            )}
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {target?.riotIdGameName}
            </Typography>
          </Box>
          <Chip
            label={sameTeam ? "Same Team" : "Opponents"}
            size="small"
            sx={{
              bgcolor: (t) =>
                sameTeam
                  ? t.palette.mode === "light" ? "#e0e7ff" : "rgba(99,102,241,0.15)"
                  : t.palette.mode === "light" ? "#fef3c7" : "rgba(251,191,36,0.12)",
              color: (t) =>
                sameTeam
                  ? t.palette.mode === "light" ? "#4f46e5" : "#818cf8"
                  : t.palette.mode === "light" ? "#92400e" : "#fbbf24",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto", fontSize: "0.8rem", fontWeight: 500 }}
          >
            {match.queueType} &middot; {formatDuration(match.gameDuration)} &middot;{" "}
            {formatDate(match.gameCreation)}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <TeamTable
          participants={match.participants}
          teamId={100}
          playerPuuid={match.playerPuuid}
          targetPuuid={match.targetPuuid}
          ddBase={ddBase}
        />
        <Divider sx={{ my: 1.5 }} />
        <TeamTable
          participants={match.participants}
          teamId={200}
          playerPuuid={match.playerPuuid}
          targetPuuid={match.targetPuuid}
          ddBase={ddBase}
        />
      </AccordionDetails>
    </Accordion>
  );
}

interface ResultsDisplayProps {
  matches: MatchResult[];
}

export function ResultsDisplay({ matches }: ResultsDisplayProps) {
  const ddVersion = useDDragonVersion();
  const ddBase = ddragonBase(ddVersion);

  if (matches.length === 0) return null;

  return (
    <Box sx={{ mt: 3, display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 700, color: "text.primary" }}
      >
        Games Played Together ({matches.length})
      </Typography>
      {matches.map((match) => (
        <MatchCard key={match.matchId} match={match} ddBase={ddBase} />
      ))}
    </Box>
  );
}
