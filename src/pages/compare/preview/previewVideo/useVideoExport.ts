import { useCallback, useEffect, useRef, useState } from "react";
import type { Layout } from "./renderFrame";
import posthog from "../../../../posthog";

export type ExportConfig = {
  videos: { url: string; times: { start: number; end: number }; label: string | null; framerate: number }[];
  fileName: string;
  freezeFrameTime: number;
  layout: Layout;
};

export type WorkerMessage =
  { type: "PROGRESS"; progress: number } | { type: "SUCCESS"; buffer: ArrayBuffer } | { type: "ERROR"; error: string };

export function useVideoExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  const cleanupWorker = useCallback(() => {
    workerRef.current?.postMessage({ type: "CANCEL" });
    workerRef.current = null;
  }, []);

  const startExport = useCallback(
    (config: ExportConfig) => {
      if (workerRef.current) {
        return;
      }
      setIsExporting(true);
      setProgress(0);
      setError(null);
      workerRef.current = new Worker(new URL("./exportWorker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const message = e.data;
        if (message.type === "PROGRESS") setProgress(message.progress);
        if (message.type === "SUCCESS") {
          setIsExporting(false);
          setProgress(100);
          posthog.capture("export_completed", {
            file_count: config.videos.length,
            layout: config.layout,
            freeze_frame_time: config.freezeFrameTime,
          });
          const blob = new Blob([message.buffer], { type: "video/mp4" });
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = config.fileName + ".mp4";
          a.click();
          URL.revokeObjectURL(downloadUrl);
          cleanupWorker();
        }
        if (message.type === "ERROR") {
          posthog.capture("export_failed", {
            file_count: config.videos.length,
            layout: config.layout,
          });
          setError(message.error);
          setIsExporting(false);
          cleanupWorker();
        }
      };
      workerRef.current.postMessage({ type: "START_EXPORT", payload: config });
    },
    [cleanupWorker],
  );

  useEffect(() => {
    return cleanupWorker;
  }, [cleanupWorker]);

  return {
    startExport,
    isExporting,
    progress,
    error,
    cancelExport: cleanupWorker,
  };
}
