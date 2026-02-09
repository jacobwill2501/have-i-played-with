import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TagIcon from "@mui/icons-material/Tag";
import { RegionSelect } from "./RegionSelect";
import { SearchDepth, SearchMode, SearchParams } from "../types";

const modernInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    bgcolor: (t) =>
      t.palette.mode === "light" ? "#f8fafc" : "rgba(255,255,255,0.04)",
    borderRadius: 3,
    transition: "all 0.2s ease",
    "& fieldset": {
      borderColor: "divider",
      borderWidth: 1.5,
    },
    "&:hover fieldset": {
      borderColor: "text.secondary",
    },
    "&.Mui-focused": {
      bgcolor: "background.paper",
      "& fieldset": {
        borderColor: "primary.main",
        borderWidth: 2,
        boxShadow: "0 0 0 4px rgba(99,102,241,0.1)",
      },
    },
  },
  "& .MuiOutlinedInput-input": {
    fontWeight: 500,
    color: "text.primary",
    "&::placeholder": {
      color: "text.secondary",
      opacity: 0.7,
    },
  },
};

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  onCancel: () => void;
  isSearching: boolean;
}

export function SearchForm({ onSearch, onCancel, isSearching }: SearchFormProps) {
  const [mode, setMode] = useState<SearchMode>("played-with");
  const [playerName, setPlayerName] = useState("");
  const [playerTag, setPlayerTag] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetTag, setTargetTag] = useState("");
  const [region, setRegion] = useState("na1");
  const [depth, setDepth] = useState<SearchDepth>("season");

  const isPlayerValid = playerName.length > 0 && playerTag.length > 0;
  const isTargetValid = targetName.length > 0 && targetTag.length > 0;

  const canSubmit =
    !isSearching &&
    isPlayerValid &&
    region &&
    (mode === "common-players" || isTargetValid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSearch({
      player: `${playerName}#${playerTag}`,
      target: mode === "played-with" ? `${targetName}#${targetTag}` : undefined,
      region,
      depth,
      mode,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Tabs
        value={mode}
        onChange={(_e, val) => setMode(val)}
        sx={{
          mb: 3.5,
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: 99,
          },
        }}
        centered
      >
        <Tab
          value="played-with"
          label="Played With?"
          icon={<SearchIcon />}
          iconPosition="start"
        />
        <Tab
          value="common-players"
          label="Common Players"
          icon={<PeopleIcon />}
          iconPosition="start"
        />
      </Tabs>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <RegionSelect value={region} onChange={setRegion} />

        <Box>
          <Typography
            variant="body2"
            sx={{ mb: 1, fontWeight: 600, color: "text.primary", fontSize: "0.85rem" }}
          >
            Your Riot ID
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <TextField
              placeholder="Faker"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              sx={{ flex: 2, ...modernInputSx }}
              size="medium"
            />
            <TagIcon sx={{ fontSize: 20, color: "text.secondary", flexShrink: 0 }} />
            <TextField
              placeholder="NA1"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value)}
              sx={{ flex: 1, ...modernInputSx }}
              size="medium"
            />
          </Box>
        </Box>

        {mode === "played-with" && (
          <>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: "text.primary", fontSize: "0.85rem" }}
              >
                Search for Player
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <TextField
                  placeholder="Hide on bush"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  sx={{ flex: 2, ...modernInputSx }}
                  size="medium"
                />
                <TagIcon sx={{ fontSize: 20, color: "text.secondary", flexShrink: 0 }} />
                <TextField
                  placeholder="NA1"
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value)}
                  sx={{ flex: 1, ...modernInputSx }}
                  size="medium"
                />
              </Box>
            </Box>

            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.85rem" }}
                >
                  Search Depth
                </Typography>
                <Tooltip
                  title="Searching further back requires more time due to the number of matches to check"
                  arrow
                >
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 16,
                      color: "text.secondary",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              </Box>
              <ToggleButtonGroup
                value={depth}
                exclusive
                onChange={(_e, val) => val && setDepth(val)}
                fullWidth
                size="small"
                sx={{ gap: 1 }}
              >
                <ToggleButton value="season">Current Season</ToggleButton>
                <ToggleButton value="year">Last Year</ToggleButton>
                <Tooltip title="Riot retains match data for approximately 2 years. Older matches may not be available." arrow>
                  <ToggleButton value="all">All History</ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          </>
        )}

        {mode === "common-players" && (
          <Box
            sx={{
              bgcolor: (t) =>
                t.palette.mode === "light" ? "#f0f4ff" : "rgba(99,102,241,0.08)",
              borderRadius: 2.5,
              px: 2.5,
              py: 1.5,
              border: 1,
              borderColor: (t) =>
                t.palette.mode === "light" ? "#e0e7ff" : "rgba(99,102,241,0.2)",
            }}
          >
            <Typography variant="body2" sx={{ color: "primary.light", fontWeight: 500 }}>
              Finds players you&apos;ve played with 3+ times this season in ranked
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canSubmit}
            startIcon={mode === "played-with" ? <SearchIcon /> : <PeopleIcon />}
            sx={{ flex: 1, py: 1.5 }}
          >
            {mode === "played-with" ? "Search" : "Find Common Players"}
          </Button>
          {isSearching && (
            <Button
              variant="outlined"
              size="large"
              color="error"
              onClick={onCancel}
              startIcon={<CancelIcon />}
              sx={{
                borderWidth: 1.5,
                "&:hover": { borderWidth: 1.5 },
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
