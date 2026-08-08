import { registerMediabunnyServer } from "@mediabunny/server";
import e from "express";
import { fileURLToPath } from "node:url";
import { FontLibrary } from "skia-canvas";
import { runMediabunnyPipeline } from "./export";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import multer, { type Multer } from "multer";

const app = e();
registerMediabunnyServer();

try {
  const fontUrl = new URL("../../../../assets/shared/fonts/Outfit-VariableFont_wght.woff2", import.meta.url);
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
  try {
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
    const config = JSON.parse(rawConfig)
    const filePaths = files.map((f) => f.path);

    await runMediabunnyPipeline(filePaths, config)
    
  } catch(error){
    res.status(500).json({ error: "Something went wrong during the export" })
    return
  }
});

app.get("/api/exports:jobId/download", (req, res) => {
  const job = exportJobs.get(req.params.jobId)
  if (!job || job.status !== "complete"){
    res.sendStatus(404);
    return;
  }
  res.download(job.outputPath, job.downloadName)
})