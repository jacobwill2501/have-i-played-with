import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { REGIONS } from "../types";

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function RegionSelect({ value, onChange }: RegionSelectProps) {
  return (
    <FormControl
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          "& fieldset": {
            borderWidth: 1.5,
          },
          "&.Mui-focused fieldset": {
            borderWidth: 2,
          },
        },
      }}
    >
      <InputLabel id="region-label">Region</InputLabel>
      <Select
        labelId="region-label"
        value={value}
        label="Region"
        onChange={(e) => onChange(e.target.value)}
      >
        {REGIONS.map((r) => (
          <MenuItem key={r.value} value={r.value}>
            {r.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
