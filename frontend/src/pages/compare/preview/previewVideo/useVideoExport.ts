import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExportConfig } from "@plscompare/shared/types";

export function useVideoExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const jobId = useRef<string | null>(null);

  const startExport = async (files: File[], config: ExportConfig) => {
    if (jobId.current) return;
    setIsExporting(true);
    setProgress(0);
    setError(null);
    const body = new FormData();
    body.append("config", JSON.stringify(config));
    files.forEach((file) => {
      body.append("files", file);
    });
    const response = await fetch("/api/exports", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      setError("Export failed to start. Try again?");
    }

    jobId.current = (await response.json()).jobId;

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/exports/${jobId.current}`);

      if (!jobId.current) {
        window.clearInterval(interval);
      }

      if (!response.ok) {
        return;
      }

      const job = await response.json();

      if (job.status === "failed") {
        setError(job.error);
        setIsExporting(false);
        window.clearInterval(interval);
      }

      setProgress(job.progress);

      if (job.status === "complete") {
        window.clearInterval(interval);
        window.location.assign(job.downloadUrl);
        jobId.current = null;
        setIsExporting(false);
      }
    }, 1000);
  };

  async function cancelExport() {
    if (!jobId.current) return;
    const response = await fetch(`/api/exports/${jobId.current}`, { method: "DELETE" });
    if (!response.ok) {
      return;
    }
    jobId.current = null;
    setProgress(0);
    setError(null);
    setIsExporting(false);
  }

  return {
    startExport,
    isExporting,
    progress,
    cancelExport,
    error,
  };
}
