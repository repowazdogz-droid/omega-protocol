"use client";

import * as React from "react";

export default function DevWatermark() {
  // Only show in dev
  if (process.env.NODE_ENV !== "development") return null;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Now safe: client-only
  const host =
    typeof window !== "undefined" ? window.location.host : "";

  return (
    <div
      className="text-xs text-zinc-500 mt-0.5 opacity-70"
      suppressHydrationWarning
    >
      DEV • {host}
    </div>
  );
}

