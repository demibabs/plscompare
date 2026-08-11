import { useRef, useState } from "react";
import type { ExportConfig } from "@plscompare/shared/types";
import { shortenVideoForUpload } from "./shortenVideoForUpload";
import axios, { type AxiosProgressEvent } from "axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function useVideoExport() {
  const [phase, setPhase] = useState<"Uploading" | "Rendering" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const jobId = useRef<string | null>(null);
  const preprocessingController = useRef<AbortController | null>(null);

  const BACKEND_URL = String(import.meta.env.VITE_BACKEND_URL);

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
        response = await axios(`${BACKEND_URL}/api/exports`, {
          method: "POST",
          data: body,
          signal: controller.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentage = Math.round((progressEvent.progress ?? 0) * 100);
            setProgress(percentage);
          },
        });
      } catch (error) {
        setError(String(error));
        return;
      }


      const startPayload = response?.data
      if (!isRecord(startPayload) || typeof startPayload.jobId !== "string") {
        throw new Error("The export server returned an invalid response.");
      }
      jobId.current = startPayload.jobId;
      setPhase("Rendering")
      const interval = window.setInterval(() => {
        void (async () => {
          const currentJobId = jobId.current;
          if (!currentJobId) {
            window.clearInterval(interval);
            return;
          }

          const statusResponse = await fetch(`${BACKEND_URL}/api/exports/${currentJobId}`);
          if (!statusResponse.ok) return;

          const job: unknown = await statusResponse.json();
          if (!isRecord(job) || typeof job.status !== "string") return;

          if (typeof job.progress === "number") setProgress(job.progress);

          if (job.status === "failed") {
            setError(typeof job.error === "string" ? job.error : "The export failed.");
            jobId.current = null;
            window.clearInterval(interval);
            return;
          }

          if (job.status === "canceled") {
            jobId.current = null;
            window.clearInterval(interval);
            return;
          }

          if (job.status === "complete" && typeof job.downloadUrl === "string") {
            window.clearInterval(interval);
            setProgress(100);
            window.location.assign(`${BACKEND_URL}${job.downloadUrl}`);
            jobId.current = null;
          }
        })().catch((pollError: unknown) => {
          console.error("Failed to check export status:", pollError);
        });
      }, 1000);
    } catch (exportError: unknown) {
      if (!controller.signal.aborted) {
        setError(errorMessage(exportError));
      }
    } finally {
      if (preprocessingController.current === controller) {
        preprocessingController.current = null;
      }
    }
  };

  async function cancelExport() {
    if (preprocessingController.current) {
      preprocessingController.current.abort();
      preprocessingController.current = null;
    }

    const currentJobId = jobId.current;
    if (currentJobId) {
      const response = await fetch(`${BACKEND_URL}/api/exports/${currentJobId}`, { method: "DELETE" });
      if (!response.ok) return;
      jobId.current = null;
    }
  }

  return {
    startExport,
    phase,
    progress,
    cancelExport,
    error,
  };
}
