import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExportConfig } from "@plscompare/shared/types";
import posthog from "../../../../posthog";
import { get } from "idb-keyval";
import type { FrameData } from "../../../../utils/getFrameData";

export function useVideoExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startExport = async (files: File[], config: ExportConfig) => {
    const body = new FormData();
    body.append("config", JSON.stringify(config));
    files.forEach((file) => {
      body.append("files", file);
    });
    setIsExporting(true);
    const response = await fetch("/api/exports", {
      method: "POST",
      body,
    });
    const { jobId } = await response.json();

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/exports/${jobId}`);

      if (!response.ok) {
        return
      }

      const job = await response.json();

      if (job.status === "complete") {
        window.clearInterval(interval);
        setIsExporting(false);
        window.location.assign(job.downloadUrl);
      }

    }, 1000);
  };

  return {
    startExport,
    isExporting,
    progress,
    error,
  };
}
