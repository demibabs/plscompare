import e from "express";
import { runFfmpegPipeline } from "./runFfmpegPipeline";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { exportJobs, type ExportJob } from "./exportJobs";
import { rm } from "node:fs";
import cors from "cors";
import type { ExportConfig } from "@plscompare/shared/types";

const app = e();

app.use(
  cors({
    origin: "*",
  }),
);

const jobId = randomUUID();

const uploadDirectory = join(tmpdir(), jobId, "uploads");
await mkdir(uploadDirectory, { recursive: true });
const upload = multer({
  dest: uploadDirectory,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isExportConfig(value: unknown): value is ExportConfig {
  if (!isRecord(value) || !Array.isArray(value.videos)) return false;
  if (typeof value.fileName !== "string" || typeof value.freezeFrameTime !== "number") return false;
  if (!(["default", "vertical", "horizontal", "grid"] as unknown[]).includes(value.layout)) return false;

  return value.videos.every((video: unknown) => {
    if (!isRecord(video) || !isRecord(video.times)) return false;
    return (
      (typeof video.label === "string" || video.label === null) &&
      typeof video.framerate === "number" &&
      typeof video.times.start === "number" &&
      typeof video.times.end === "number" &&
      (video.sourceTimeOffset === undefined || typeof video.sourceTimeOffset === "number")
    );
  });
}

function isExportCanceled(job: ExportJob) {
  return job.status === "canceled";
}

app.post("/api/exports", upload.array("files"), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files.length) {
    res.status(400).json({ error: "No videos uploaded" });
    return;
  }
  const body: unknown = req.body;
  const rawConfig = isRecord(body) ? body.config : undefined;
  if (typeof rawConfig !== "string") {
    res.status(400).json({ error: "Missing export config" });
    return;
  }
  const parsedConfig: unknown = JSON.parse(rawConfig);
  if (!isExportConfig(parsedConfig)) {
    res.status(400).json({ error: "Invalid export config" });
    return;
  }
  const config = parsedConfig;
  const fileName = config.fileName;
  const filePaths = files.map((f) => f.path);

  const job: ExportJob = {
    id: jobId,
    fileName,
    status: "queued",
    progress: 0,
    createdAt: new Date(),
  };

  exportJobs.set(jobId, job);

  res.status(202).json({ jobId });

  job.status = "processing";

  const exportDirectory = join(tmpdir(), "exports", job.id);
  await mkdir(exportDirectory, { recursive: true });
  job.outputPath = join(exportDirectory, `output.mp4`);
  try {
    await runFfmpegPipeline(filePaths, config, job, (number) => {
      job.progress = number;
    });
  } catch (error: unknown) {
    job.error = String(error);
    job.status = "failed";
    rm(exportDirectory, { recursive: true, force: true }, (error) => {
      if (error) {
        console.error("Failed to delete folder:", error);
      }
    });
    return;
  }
  if (isExportCanceled(job)) {
    rm(exportDirectory, { recursive: true, force: true }, (error) => {
      if (error) {
        console.error("Failed to delete folder:", error);
      }
    });
    return;
  }
  job.status = "complete";
  job.progress = 100;
});

app.get("/api/exports/:jobId", (req, res) => {
  const job = exportJobs.get(req.params.jobId);

  if (!job) {
    res.sendStatus(404);
    return;
  }

  res.json({
    status: job.status,
    progress: job.progress,
    downloadUrl: job.status === "complete" ? `/api/exports/${job.id}/download` : undefined,
  });
});

app.get("/api/exports/:jobId/download", (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (job?.status !== "complete" || !job.outputPath) {
    res.sendStatus(404);
    return;
  }
  const outputPath = job.outputPath;
  res.download(outputPath, `${job.fileName}.mp4`, (error) => {
    if (error && !res.headersSent) {
      return res.status(500).send("Download failed.");
    }

    rm(dirname(outputPath), { recursive: true, force: true }, (error) => {
      if (error) {
        console.error("Failed to delete folder:", error);
      }
    });
  });
});

app.delete("/api/exports/:jobId", (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job) {
    res.sendStatus(404);
    return;
  }
  job.status = "canceled";
  res.sendStatus(200);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Port ${String(port)} is listening :)`);
});
