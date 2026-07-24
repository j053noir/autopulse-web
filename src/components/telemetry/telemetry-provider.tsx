"use client";

import React, { useEffect, useRef } from "react";
import { initTelemetry } from "@/lib/telemetry";

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Run asynchronously after mount to ensure it's completely non-blocking
      const handle = setTimeout(() => {
        initTelemetry();
      }, 0);
      initialized.current = true;
      return () => clearTimeout(handle);
    }
  }, []);

  return <>{children}</>;
}
