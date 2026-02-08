import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const FALLBACK_VERSION = "14.24.1";

let cachedVersion: string | null = null;

export function useDDragonVersion(): string {
  const [version, setVersion] = useState(cachedVersion || FALLBACK_VERSION);

  useEffect(() => {
    if (cachedVersion) return;
    fetch(`${API_BASE}/api/ddragon-version`)
      .then((res) => res.json())
      .then((data: { version: string }) => {
        cachedVersion = data.version;
        setVersion(data.version);
      })
      .catch(() => {
        // keep fallback
      });
  }, []);

  return version;
}

export function ddragonBase(version: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}`;
}
