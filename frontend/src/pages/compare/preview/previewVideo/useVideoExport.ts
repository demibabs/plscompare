import { useCallback, useEffect, useRef, useState } from "react";
import type { ExportConfig } from "@plscompare/shared/types";
import { shortenVideoForUpload } from "./shortenVideoForUpload";
import axios, { type AxiosProgressEvent } from "axios";
import posthog from "../../../../posthog";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function useVideoExport() {
  const [phase, setPhase] = useState<"Uploading" | "Rendering" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const jobId = useRef<string | null>(null);
  const preprocessingController = useRef<AbortController | null>(null);

  const BACKEND_URL = String(import.meta.env.VITE_BACKEND_URL ?? "");

  const cancelExport = useCallback(() => {
    const currentJobId = jobId.current;
    jobId.current = null;

    if (preprocessingController.current) {
      preprocessingController.current.abort();
      preprocessingController.current = null;
    }

    if (currentJobId) {
      void fetch(`${BACKEND_URL}/exports/${currentJobId}`, { method: "DELETE" }).catch(() => undefined);
    }
  }, [BACKEND_URL]);

  const startExport = async (files: File[], config: ExportConfig) => {
    if (jobId.current || preprocessingController.current) return;

    const controller = new AbortController();
    preprocessingController.current = controller;
    setPhase("Uploading");
    setProgress(0);
    setError(null);

    try {
      if (files.length !== config.videos.length) {
        throw new Error("The selected files do not match the export configuration.");
      }

      const shortenedFiles: File[] = [];
      const videos: ExportConfig["videos"] = [];

      // Process one file at a time to limit peak browser memory usage.
      for (let index = 0; index < files.length; index++) {
        const video = config.videos[index];
        const shortened = await shortenVideoForUpload(files[index], video.times, controller.signal);
        shortenedFiles.push(shortened.file);
        videos.push({ ...video, sourceTimeOffset: shortened.sourceTimeOffset });
      }

      const body = new FormData();
      body.append("config", JSON.stringify({ ...config, videos }));
      shortenedFiles.forEach((file) => {
        body.append("files", file);
      });

      let response;
      try {
        response = await axios(`${BACKEND_URL}/exports`, {
          method: "POST",
          data: body,
          signal: controller.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentage = Math.round((progressEvent.progress ?? 0) * 100);
            setProgress(percentage);
          },
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setError("Couldn't upload videos.");
        posthog.capture("export_failed", { reason: error });
        return;
      }

      const startPayload: unknown = response.data;
      if (!isRecord(startPayload) || typeof startPayload.jobId !== "string") {
        throw new Error("The server returned an invalid response.");
      }
      jobId.current = startPayload.jobId;
      const pollingJobId = startPayload.jobId;
      let failCount = 0;
      await poll();
      async function poll() {
        if (jobId.current !== pollingJobId) return;

        try {
          const currentJobId = jobId.current;
          if (!currentJobId) {
            cancelExport();
            return;
          }

          const statusResponse = await fetch(`${BACKEND_URL}/exports/${currentJobId}`).catch((error: unknown) => {
            failCount++;
            throw new Error(String(error));
          });

          if (jobId.current !== pollingJobId) {
            return;
          }

          if (!statusResponse.ok) {
            failCount++;
            if (failCount >= 3) {
              throw new Error("Could not reach server.");
            }
            return;
          }

          const job: unknown = await statusResponse.json().catch(() => {
            failCount = 3;
            throw new Error("Received malformed JSON from server.");
          });

          if (jobId.current !== pollingJobId) {
            return;
          }

          if (!isRecord(job) || typeof job.status !== "string") {
            failCount = 3;
            throw new Error("Invalid response.");
          }
          if (typeof job.progress === "number") setProgress(job.progress);
          setPhase("Rendering");
          failCount = 0;

          if (job.status === "failed") {
            setError("The export failed.");
            posthog.capture("export_failed", { reason: job.error });
            jobId.current = null;
            cancelExport();
            return;
          }

          if (job.status === "canceled") {
            jobId.current = null;
            cancelExport();
            return;
          }

          if (job.status === "complete" && typeof job.downloadUrl === "string") {
            setProgress(100);
            posthog.capture("export_completed")
            window.location.assign(`${BACKEND_URL}${job.downloadUrl}`);
            jobId.current = null;
          }
        } catch (pollError: unknown) {
          console.error("Failed to check export status:", pollError);
          if (jobId.current !== pollingJobId) return;
          if (failCount >= 3) {
            setError("Export failed.");
            posthog.capture("export_failed", { reason: pollError });
            cancelExport();
          }
        } finally {
          if (jobId.current === pollingJobId) setTimeout(poll, 1000);
        }
      }
    } catch (exportError: unknown) {
      if (!controller.signal.aborted) {
        setError("Export failed.");
        posthog.capture("export_failed", { reason: exportError });
        cancelExport();
      }
    } finally {
      if (preprocessingController.current === controller) {
        preprocessingController.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      cancelExport();
    };
  }, [cancelExport]);

  return {
    startExport,
    phase,
    progress,
    cancelExport,
    error,
  };
}
