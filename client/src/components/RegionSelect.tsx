import { Box, Chip, Typography } from "@mui/material";
import { REGIONS } from "../types";

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function RegionSelect({ value, onChange }: RegionSelectProps) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 600, color: "text.primary", fontSize: "1rem" }}
      >
        Region
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {REGIONS.map((r) => {
          const isSelected = r.value === value;
          return (
            <Chip
              key={r.value}
              label={r.label}
              onClick={() => onChange(r.value)}
              variant={isSelected ? "filled" : "outlined"}
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: 2,
                borderWidth: 1.5,
                transition: "all 0.15s ease",
                ...(isSelected
                  ? {
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      borderColor: "transparent",
                      boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                    }
                  : {
                      borderColor: "divider",
                      color: "text.secondary",
                      "&:hover": {
                        borderColor: "primary.main",
                        color: "primary.main",
                        bgcolor: (t) =>
                          t.palette.mode === "light"
                            ? "rgba(99,102,241,0.06)"
                            : "rgba(99,102,241,0.1)",
                      },
                    }),
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
