import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CommonPlayer } from "../types";
import { ResultsDisplay } from "./ResultsDisplay";
import { useDDragonVersion, ddragonBase } from "../hooks/useDDragonVersion";

function getMostPlayedChampion(player: CommonPlayer): string {
  const champCounts = new Map<string, number>();
  for (const match of player.matches) {
    const participant = match.participants.find(
      (p) => p.puuid === player.puuid
    );
    if (participant) {
      champCounts.set(
        participant.championName,
        (champCounts.get(participant.championName) || 0) + 1
      );
    }
  }
  let best = "";
  let bestCount = 0;
  for (const [champ, count] of champCounts) {
    if (count > bestCount) {
      best = champ;
      bestCount = count;
    }
  }
  return best;
}

interface CommonPlayersDisplayProps {
  players: CommonPlayer[];
}

export function CommonPlayersDisplay({ players }: CommonPlayersDisplayProps) {
  const ddVersion = useDDragonVersion();
  const ddBase = ddragonBase(ddVersion);
  const [selectedPlayer, setSelectedPlayer] = useState<CommonPlayer | null>(
    null
  );

  if (players.length === 0) return null;

  return (
    <>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Common Players ({players.length})
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {players.map((player) => {
            const topChamp = getMostPlayedChampion(player);
            return (
              <Card key={player.puuid} variant="outlined">
                <CardActionArea onClick={() => setSelectedPlayer(player)}>
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {topChamp && (
                      <Avatar
                        src={`${ddBase}/img/champion/${topChamp}.png`}
                        alt={topChamp}
                        sx={{ width: 48, height: 48 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {player.riotIdGameName}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          #{player.riotIdTagline}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Most played: {topChamp}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${player.gamesPlayed} games`}
                      color="primary"
                      size="small"
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Dialog
        open={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedPlayer && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
              Games with {selectedPlayer.riotIdGameName}#
              {selectedPlayer.riotIdTagline} ({selectedPlayer.gamesPlayed})
              <IconButton
                onClick={() => setSelectedPlayer(null)}
                sx={{ ml: "auto" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <ResultsDisplay matches={selectedPlayer.matches} />
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
