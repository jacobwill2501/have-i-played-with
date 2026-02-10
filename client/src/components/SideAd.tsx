import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function SideAd() {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ad blocker or script not loaded
    }
  }, []);

  return (
    <Box
      sx={{
        width: 160,
        minHeight: 600,
        position: "sticky",
        top: 24,
      }}
    >
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: "block" }}
        data-ad-client="ca-pub-7176021378506244"
        data-ad-slot=""
        data-ad-format="vertical"
        data-full-width-responsive="false"
      />
    </Box>
  );
}
