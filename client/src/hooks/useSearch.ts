import { useState, useCallback, useRef } from "react";
import {
  SearchParams,
  SearchStatus,
  MatchResult,
  ProgressEvent,
  CommonPlayer,
} from "../types";

// In dev, Vite proxies /api to the server. In prod, same origin serves both.
const API_BASE = import.meta.env.VITE_API_URL || "";

export function useSearch() {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [progress, setProgress] = useState<ProgressEvent>({
    searched: 0,
    total: 0,
    percent: 0,
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [commonPlayers, setCommonPlayers] = useState<CommonPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("idle");
    setProgress({ searched: 0, total: 0, percent: 0 });
    setMatches([]);
    setCommonPlayers([]);
    setError(null);
  }, []);

  const search = useCallback((params: SearchParams) => {
    reset();
    setStatus("searching");

    if (params.mode === "played-with") {
      const queryParams = new URLSearchParams({
        player: params.player,
        target: params.target!,
        region: params.region,
        depth: params.depth,
      });

      const es = new EventSource(`${API_BASE}/api/search?${queryParams}`);
      eventSourceRef.current = es;

      es.addEventListener("progress", (e) => {
        setProgress(JSON.parse(e.data) as ProgressEvent);
      });

      es.addEventListener("match", (e) => {
        setMatches((prev) => [...prev, JSON.parse(e.data) as MatchResult]);
      });

      es.addEventListener("done", () => {
        setStatus("done");
        es.close();
      });

      es.addEventListener("error", (e) => {
        if (e instanceof MessageEvent && e.data) {
          setError(JSON.parse(e.data).message);
        } else {
          setError("Connection lost. Please try again.");
        }
        setStatus("error");
        es.close();
      });
    } else {
      // common-players mode
      const queryParams = new URLSearchParams({
        player: params.player,
        region: params.region,
      });

      const es = new EventSource(`${API_BASE}/api/common-players?${queryParams}`);
      eventSourceRef.current = es;

      es.addEventListener("progress", (e) => {
        setProgress(JSON.parse(e.data) as ProgressEvent);
      });

      es.addEventListener("result", (e) => {
        setCommonPlayers(JSON.parse(e.data) as CommonPlayer[]);
      });

      es.addEventListener("done", () => {
        setStatus("done");
        es.close();
      });

      es.addEventListener("error", (e) => {
        if (e instanceof MessageEvent && e.data) {
          setError(JSON.parse(e.data).message);
        } else {
          setError("Connection lost. Please try again.");
        }
        setStatus("error");
        es.close();
      });
    }
  }, [reset]);

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("idle");
  }, []);

  return { status, progress, matches, commonPlayers, error, search, cancel, reset };
}
