import { registerMediabunnyServer } from "@mediabunny/server";
import e from "express";
import { fileURLToPath } from "node:url";
import { FontLibrary } from "skia-canvas";
import { runMediabunnyPipeline } from "./runMediabunnyPipeline";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import multer, { type Multer } from "multer";
import { randomUUID } from "node:crypto";
import { exportJobs, type ExportJob } from "./exportJobs";
import { rm } from "node:fs";

const app = e();
registerMediabunnyServer();

try {
  const fontUrl = new URL("../frontend/src/assets/shared/fonts/Outfit-VariableFont_wght.woff2", import.meta.url);
  const fontPath = fileURLToPath(fontUrl);
  FontLibrary.use("Outfit", fontPath);
} catch (err) {
  console.warn("Could not load local font:", err);
}

const uploadDirectory = join(tmpdir(), "uploads");
await mkdir(uploadDirectory, { recursive: true });
const upload = multer({
  dest: uploadDirectory,
});

app.post("/api/exports", upload.array("files"), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files.length) {
    res.status(400).json({ error: "No videos uploaded" });
    return;
  }
  const rawConfig = req.body.config;
  if (typeof rawConfig !== "string") {
    res.status(400).json({ error: "Missing export config" });
    return;
  }
  const config = JSON.parse(rawConfig);
  // type guard needed here
  const fileName = config.fileName;
  const filePaths = files.map((f) => f.path);
  const jobId = randomUUID();

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

  const outputPath = await runMediabunnyPipeline(filePaths, config, job, (number) => {
    job.progress = number;
  }).catch((error: unknown) => {
    job.error = String(error);
    job.status = "failed";
    return;
  });
  if (outputPath) {
    job.status = "complete";
    job.progress = 100;
    job.outputPath = outputPath;
  }
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
  res.download(job.outputPath, `${job.fileName}.mp4`, (error) => {
    
    if (error && !res.headersSent) {
      return res.status(500).send("Download failed.");
    }

    rm(join("..", job.outputPath), { recursive: true, force: true }, (error) => {
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

const port = Number(process.env.port) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Port ${String(port)} is listening :)`);
});
