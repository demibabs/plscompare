import e from "express";
import { runFfmpegPipeline } from "./runFfmpegPipeline";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import multer from "multer";
import { randomUUID, type UUID } from "node:crypto";
import { exportJobs, type ExportJob } from "./exportJobs";
import cors from "cors";
import type { ExportConfig } from "@plscompare/shared/types";

const app = e();

const jobsDirectory = join(tmpdir(), "plscompare", "jobs");

// Clear jobs directory on startup (doesnt matter for deployed version)
await rm(jobsDirectory, { recursive: true, force: true });

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Port ${String(port)} is listening :)`);
});

// Will fix lmao
app.use(
  cors({
    origin: "*",
  }),
);

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

function getDirectory(jobId: string) {
  return join(jobsDirectory, jobId);
}

// Wait 1 hour, then delete both uploads and exports
function removeJob(jobId: string) {
  const timer = setTimeout(
    () => {
      const directory = getDirectory(jobId);
      void rm(directory, { recursive: true, force: true }).catch((error: unknown) => {
        console.error("Failed to delete folder", String(error));
      });
      exportJobs.delete(jobId);
    },
    1000 * 60 * 60,
  );
  timer.unref();
}

app.post("/exports", async (req, res, next) => {
  const jobId = randomUUID();
  res.locals.jobId = jobId;
  const uploadDirectory = join(getDirectory(jobId), "uploads");

  await mkdir(uploadDirectory, { recursive: true });

  multer({
    dest: uploadDirectory,
  }).array("files")(req, res, (error) => {
    if (error) {
      removeJob(jobId);
      next(error);
      return;
    }
    next();
  });
});

app.post("/exports", async (req, res) => {
  const jobId: UUID = res.locals.jobId;
  const directory = getDirectory(jobId);
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
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

    const exportDirectory = join(directory, "exports");
    await mkdir(exportDirectory, { recursive: true });
    job.outputPath = join(exportDirectory, `output.mp4`);
    try {
      await runFfmpegPipeline(filePaths, config, job, (number) => {
        job.progress = number;
      });
    } catch (error: unknown) {
      job.error = String(error);
      job.status = "failed";
      return;
    }
    if (isExportCanceled(job)) {
      return;
    }
    job.status = "complete";
    job.progress = 100;
  } finally {
    removeJob(jobId);
  }
});

app.get("/exports/:jobId", (req, res) => {
  const job = exportJobs.get(req.params.jobId);

  if (!job) {
    res.sendStatus(404);
    return;
  }

  res.json({
    status: job.status,
    progress: job.progress,
    downloadUrl: job.status === "complete" ? `/exports/${job.id}/download` : undefined,
    error: job.error,
  });
});

app.get("/exports/:jobId/download", async (req, res) => {
  const jobId = req.params.jobId;
  const job = exportJobs.get(jobId);
  if (job?.status !== "complete" || !job.outputPath) {
    res.sendStatus(404);
    return;
  }
  try {
    const outputPath = job.outputPath;
    await new Promise<void>((resolve, reject) => {
      res.download(outputPath, `${job.fileName}.mp4`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    if (error && !res.headersSent) {
      return res.status(500).send("Download failed.");
    }
  }
});

app.delete("/exports/:jobId", (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job) {
    res.sendStatus(404);
    return;
  }
  job.status = "canceled";
  res.sendStatus(200);
});
