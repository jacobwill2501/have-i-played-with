import { Container, Typography, Box, Alert, CssBaseline, IconButton, Tooltip } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { SearchForm } from "./components/SearchForm";
import { SearchProgress } from "./components/SearchProgress";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { CommonPlayersDisplay } from "./components/CommonPlayersDisplay";
import { SideAd } from "./components/SideAd";
import { useSearch } from "./hooks/useSearch";
import { useColorMode } from "./hooks/useColorMode";

function App() {
  const { mode, toggle, theme } = useColorMode();
  const {
    status,
    progress,
    matches,
    commonPlayers,
    error,
    search,
    cancel,
  } = useSearch();

  const isLight = mode === "light";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: isLight
            ? "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #ffffff 100%)"
            : "linear-gradient(180deg, #0c0c1d 0%, #101028 40%, #161630 100%)",
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", top: 20, right: 24 }}>
          <Tooltip title={isLight ? "Switch to dark mode" : "Switch to light mode"}>
            <IconButton
              onClick={toggle}
              sx={{
                bgcolor: isLight ? "#fff" : "#1e1e3f",
                border: 1,
                borderColor: "divider",
                boxShadow: isLight
                  ? "0 1px 4px rgba(0,0,0,0.08)"
                  : "0 1px 4px rgba(0,0,0,0.4)",
                "&:hover": {
                  bgcolor: isLight ? "#f1f5f9" : "#2d2d52",
                },
              }}
            >
              {isLight ? (
                <DarkModeIcon sx={{ fontSize: 20, color: "#64748b" }} />
              ) : (
                <LightModeIcon sx={{ fontSize: 20, color: "#fbbf24" }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            px: 2,
            py: 6,
            minHeight: "100%",
          }}
        >
          {/* Left ad — desktop only */}
          <Box sx={{ display: { xs: "none", lg: "block" }, flexShrink: 0 }}>
            <SideAd />
          </Box>

          <Container maxWidth="md" sx={{ px: { xs: 0, sm: 3 } }}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1.5,
                }}
              >
                Have I Played With?
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Check if you&apos;ve played League of Legends with another player
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 4,
                p: { xs: 3, sm: 4 },
                mb: 3,
                boxShadow: isLight
                  ? "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(99,102,241,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.3), 0 8px 32px rgba(99,102,241,0.15)",
                border: 1,
                borderColor: "divider",
              }}
            >
              <SearchForm
                onSearch={search}
                onCancel={cancel}
                isSearching={status === "searching"}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <SearchProgress
              progress={progress}
              status={status}
              matchCount={matches.length}
            />

            {status === "done" && matches.length === 0 && commonPlayers.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No shared games found in the selected time period.
              </Alert>
            )}

            <ResultsDisplay matches={matches} />
            <CommonPlayersDisplay players={commonPlayers} />
          </Container>

          {/* Right ad — desktop only */}
          <Box sx={{ display: { xs: "none", lg: "block" }, flexShrink: 0 }}>
            <SideAd />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
