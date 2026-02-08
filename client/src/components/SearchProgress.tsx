import { Box, LinearProgress, Typography } from "@mui/material";
import { ProgressEvent, SearchStatus } from "../types";

interface SearchProgressProps {
  progress: ProgressEvent;
  status: SearchStatus;
  matchCount: number;
}

export function SearchProgress({
  progress,
  status,
  matchCount,
}: SearchProgressProps) {
  if (status === "idle") return null;

  return (
    <Box
      sx={{
        width: "100%",
        mt: 3,
        bgcolor: "background.paper",
        borderRadius: 3,
        p: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {status === "searching"
            ? `Searching... ${progress.searched} / ${progress.total} matches`
            : status === "done"
              ? "Search complete"
              : "Error"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {progress.percent}%
        </Typography>
      </Box>
      <LinearProgress
        variant={progress.total === 0 && status === "searching" ? "indeterminate" : "determinate"}
        value={progress.percent}
        sx={{ height: 8, borderRadius: 99 }}
      />
      {matchCount > 0 && (
        <Typography
          variant="body2"
          sx={{ mt: 1.5, fontWeight: 600, color: "primary.main" }}
        >
          {matchCount} game{matchCount !== 1 ? "s" : ""} found together
        </Typography>
      )}
    </Box>
  );
}
