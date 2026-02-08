import { useState, useMemo, useEffect } from "react";
import { createTheme, Theme } from "@mui/material/styles";

const shared = {
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    subtitle1: { fontWeight: 400, letterSpacing: "0.01em" },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
};

function makeTheme(mode: "light" | "dark"): Theme {
  const isLight = mode === "light";

  return createTheme({
    ...shared,
    palette: {
      mode,
      primary: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
      secondary: { main: "#ec4899" },
      background: {
        default: isLight ? "#f8fafc" : "#0c0c1d",
        paper: isLight ? "#ffffff" : "#161630",
      },
      text: {
        primary: isLight ? "#0f172a" : "#f1f5f9",
        secondary: isLight ? "#64748b" : "#94a3b8",
      },
      success: {
        main: "#22c55e",
        light: isLight ? "#dcfce7" : "#14532d",
      },
      error: {
        main: "#ef4444",
        light: isLight ? "#fee2e2" : "#7f1d1d",
      },
      divider: isLight ? "#e2e8f0" : "#2d2d52",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
            fontSize: "0.95rem",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          contained: {
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: isLight
              ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)"
              : "0 1px 3px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.4)",
            border: `1px solid ${isLight ? "#f1f5f9" : "#2d2d52"}`,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: isLight
              ? "0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.04)"
              : "0 1px 3px rgba(0,0,0,0.3), 0 2px 12px rgba(0,0,0,0.2)",
            border: `1px solid ${isLight ? "#f1f5f9" : "#2d2d52"}`,
            "&:before": { display: "none" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: "0.75rem" },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: "10px !important",
            border: `1.5px solid ${isLight ? "#e2e8f0" : "#2d2d52"} !important`,
            "&.Mui-selected": {
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              borderColor: "transparent !important",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 99,
            backgroundColor: isLight ? "#e2e8f0" : "#2d2d52",
          },
          bar: {
            borderRadius: 99,
            background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 500 },
        },
      },
    },
  });
}

export function useColorMode() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("color-mode");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("color-mode", mode);
  }, [mode]);

  const toggle = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => makeTheme(mode), [mode]);

  return { mode, toggle, theme };
}
