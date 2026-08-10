import ffmpegStatic from "ffmpeg-static";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { once } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Canvas, FontLibrary, type CanvasRenderingContext2D as SkiaCanvasRenderingContext2D } from "skia-canvas";

import { formatSecondsToSSMS } from "@plscompare/shared/formatSecondsToSSMS";
import { getCanvasDimensions } from "@plscompare/shared/getCanvasDimensions";
import { getGridDimensions, type Layout } from "@plscompare/shared/renderFrame";
import type { ExportConfig } from "@plscompare/shared/types";
import type { ExportJob } from "./exportJobs";

const FONT_SIZE = 72;
const OVERLAY_HEIGHT = FONT_SIZE + 60;
const TIMER_EPSILON_SECONDS = 0.001;
const OUTPUT_BITRATE = "5000k";
const MAX_FFMPEG_ERROR_LENGTH = 32_000;

type Container = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RasterContainer = Container & {
  rasterX: number;
  rasterY: number;
  rasterWidth: number;
  rasterHeight: number;
};

type LabelOverlay = {
  path: string;
  x: number;
  y: number;
};

type LabelInput = LabelOverlay & {
  inputIndex: number;
};

type TimerSegment = {
  videoIndex: number;
  container: Container;
  originX: number;
  originY: number;
  packedX: number;
  width: number;
  height: number;
};

type TimerOverlay = {
  width: number;
  height: number;
  segments: TimerSegment[];
};

type FfmpegResult = {
  code: number | null;
  signal: NodeJS.Signals | null;
  stderr: string;
  spawnError: Error | null;
};

const outfitFontPath = fileURLToPath(
  new URL("../frontend/src/assets/shared/fonts/Outfit-VariableFont_wght.woff2", import.meta.url),
);

let isFontRegistered = false;

function registerOutfitFont() {
  if (isFontRegistered) return;
  FontLibrary.use("Outfit", outfitFontPath);
  isFontRegistered = true;
}

function configureOverlayContext(ctx: SkiaCanvasRenderingContext2D) {
  ctx.font = `${String(FONT_SIZE)}px Outfit`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}

function finiteNumber(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number.`);
  }
}

function validateInputs(filePaths: string[], config: ExportConfig, job: ExportJob) {
  if (!job.outputPath) throw new Error("Missing output path for export job.");
  if (config.videos.length === 0) throw new Error("At least one video is required.");
  if (filePaths.length !== config.videos.length) {
    throw new Error("The number of uploaded files does not match the export configuration.");
  }

  finiteNumber(config.freezeFrameTime, "Freeze-frame duration");
  if (config.freezeFrameTime < 0) throw new Error("Freeze-frame duration cannot be negative.");

  config.videos.forEach((video, index) => {
    finiteNumber(video.times.start, `Video ${String(index + 1)} start time`);
    finiteNumber(video.times.end, `Video ${String(index + 1)} end time`);
    finiteNumber(video.framerate, `Video ${String(index + 1)} frame rate`);
    if (video.sourceTimeOffset !== undefined) {
      finiteNumber(video.sourceTimeOffset, `Video ${String(index + 1)} source time offset`);
    }
    if (video.times.start < 0 || video.times.end <= video.times.start) {
      throw new Error(`Video ${String(index + 1)} has an invalid time range.`);
    }
  });
}

function isExportCanceled(job: ExportJob) {
  return job.status === "canceled";
}

function getContainers(layout: Layout, numVideos: number, width: number, height: number): Container[] {
  if (layout === "default") {
    const containerWidth = width / numVideos;
    return Array.from({ length: numVideos }, (_, index) => ({
      x: containerWidth * index,
      y: 0,
      width: containerWidth,
      height,
    }));
  }

  if (layout === "vertical") {
    const containerHeight = height / numVideos;
    return Array.from({ length: numVideos }, (_, index) => ({
      x: 0,
      y: containerHeight * index,
      width,
      height: containerHeight,
    }));
  }

  if (layout === "horizontal") {
    const containerWidth = width / numVideos;
    return Array.from({ length: numVideos }, (_, index) => ({
      x: containerWidth * index,
      y: 0,
      width: containerWidth,
      height,
    }));
  }

  const { rows, cols } = getGridDimensions(numVideos);
  const containerWidth = width / cols;
  const containerHeight = height / rows;
  return Array.from({ length: numVideos }, (_, index) => ({
    x: (index % cols) * containerWidth,
    y: Math.floor(index / cols) * containerHeight,
    width: containerWidth,
    height: containerHeight,
  }));
}

function rasterizeContainers(containers: Container[], outputWidth: number, outputHeight: number): RasterContainer[] {
  return containers.map((container) => {
    const rasterX = Math.max(0, Math.round(container.x));
    const rasterY = Math.max(0, Math.round(container.y));
    const rasterRight = Math.min(outputWidth, Math.round(container.x + container.width));
    const rasterBottom = Math.min(outputHeight, Math.round(container.y + container.height));

    return {
      ...container,
      rasterX,
      rasterY,
      rasterWidth: Math.max(1, rasterRight - rasterX),
      rasterHeight: Math.max(1, rasterBottom - rasterY),
    };
  });
}

function getLongestVideoIndex(config: ExportConfig) {
  return config.videos.reduce((maxIndex, video, index) => {
    const duration = video.times.end - video.times.start;
    const maxVideo = config.videos[maxIndex];
    const maxDuration = maxVideo.times.end - maxVideo.times.start;
    return duration >= maxDuration ? index : maxIndex;
  }, 0);
}

function getTimerText(
  config: ExportConfig,
  longestVideoIndex: number,
  videoIndex: number,
  frameIndex: number,
  fps: number,
) {
  if (videoIndex === longestVideoIndex) return null;

  const video = config.videos[videoIndex];
  const longestVideo = config.videos[longestVideoIndex];
  const currentTimestampSeconds = frameIndex / fps;
  const sourceTime = Math.max(video.times.start + currentTimestampSeconds - config.freezeFrameTime, video.times.start);

  if (sourceTime <= video.times.end + TIMER_EPSILON_SECONDS) return null;

  const videoDuration = video.times.end - video.times.start;
  const longestDuration = longestVideo.times.end - longestVideo.times.start;
  return formatSecondsToSSMS(Math.min(sourceTime - video.times.end, longestDuration - videoDuration));
}

async function createLabelOverlays(
  config: ExportConfig,
  containers: Container[],
  measureContext: SkiaCanvasRenderingContext2D,
  exportDirectory: string,
) {
  const overlays: LabelOverlay[] = [];

  for (let index = 0; index < config.videos.length; index++) {
    const label = config.videos[index].label;
    if (!label) continue;

    const container = containers[index];
    const labelWidth = measureContext.measureText(label).width + 60;
    const labelX = container.x + (container.width - labelWidth) / 2;
    const labelY = container.y + container.height - OVERLAY_HEIGHT;
    const originX = Math.floor(labelX) - 1;
    const originY = Math.floor(labelY) - 1;
    const imageWidth = Math.max(1, Math.ceil(labelX + labelWidth) + 1 - originX);
    const imageHeight = Math.max(1, Math.ceil(labelY + OVERLAY_HEIGHT) + 1 - originY);
    const canvas = new Canvas(imageWidth, imageHeight);
    canvas.gpu = false;
    const ctx = canvas.getContext("2d");
    configureOverlayContext(ctx);

    const localX = labelX - originX;
    const localY = labelY - originY;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.roundRect(localX, localY, labelWidth, OVERLAY_HEIGHT, [20, 20, 0, 0]);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, localX + labelWidth / 2, localY + OVERLAY_HEIGHT / 2);

    const path = join(exportDirectory, `label-${String(index)}.png`);
    await canvas.toFile(path, { format: "png" });
    overlays.push({ path, x: originX, y: originY });
  }

  return overlays;
}

function getMaximumTimerWidth(measureContext: SkiaCanvasRenderingContext2D, maximumTimerSeconds: number) {
  const widestDigitWidth = Math.max(
    ...Array.from({ length: 10 }, (_, digit) => measureContext.measureText(String(digit)).width),
  );
  const wholeSecondDigits = Math.max(2, String(Math.floor(Math.max(0, maximumTimerSeconds))).length);
  const decimalPointWidth = measureContext.measureText(".").width;

  // The extra four pixels cover pair kerning and antialiasing at either edge.
  return Math.ceil((wholeSecondDigits + 3) * widestDigitWidth + decimalPointWidth + 60 + 4);
}

function createTimerOverlay(
  config: ExportConfig,
  containers: Container[],
  longestVideoIndex: number,
  totalFrames: number,
  fps: number,
  measureContext: SkiaCanvasRenderingContext2D,
): TimerOverlay | null {
  const lastFrameIndex = totalFrames - 1;
  const segments: TimerSegment[] = [];
  let packedX = 0;
  let packedHeight = 0;

  config.videos.forEach((video, videoIndex) => {
    if (!getTimerText(config, longestVideoIndex, videoIndex, lastFrameIndex, fps)) return;

    const longestVideo = config.videos[longestVideoIndex];
    const maximumTimerSeconds =
      longestVideo.times.end - longestVideo.times.start - (video.times.end - video.times.start);
    const maximumTimerWidth = getMaximumTimerWidth(measureContext, maximumTimerSeconds);
    const container = containers[videoIndex];
    const left = container.x + (container.width - maximumTimerWidth) / 2;
    const originX = Math.floor(left) - 1;
    const originY = Math.floor(container.y) - 1;
    const width = Math.max(1, Math.ceil(left + maximumTimerWidth) + 1 - originX);
    const height = Math.max(1, Math.ceil(container.y + OVERLAY_HEIGHT) + 1 - originY);

    segments.push({
      videoIndex,
      container,
      originX,
      originY,
      packedX,
      width,
      height,
    });
    packedX += width;
    packedHeight = Math.max(packedHeight, height);
  });

  if (segments.length === 0) return null;
  return { width: packedX, height: packedHeight, segments };
}

function numberForFilter(value: number) {
  return Number(value.toFixed(9)).toString();
}

function buildFilterGraph(
  config: ExportConfig,
  containers: RasterContainer[],
  outputWidth: number,
  outputHeight: number,
  fps: number,
  freezeFrameCount: number,
  totalFrames: number,
  labelInputs: LabelInput[],
  timerOverlay: TimerOverlay | null,
  timerInputIndex: number | null,
) {
  const chains: string[] = [];
  const outputDuration = totalFrames / fps;
  chains.push(
    `color=c=black:s=${String(outputWidth)}x${String(outputHeight)}:r=${String(fps)}:d=${numberForFilter(outputDuration)},format=rgb24[background]`,
  );

  config.videos.forEach((video, index) => {
    const container = containers[index];
    const clipDuration = video.times.end - video.times.start + 0.005;
    const fitFilter =
      config.layout === "default"
        ? `scale=w=${String(container.rasterWidth)}:h=${String(container.rasterHeight)}:force_original_aspect_ratio=increase:flags=bilinear,crop=w=${String(container.rasterWidth)}:h=${String(container.rasterHeight)}:x=(iw-ow)/2:y=(ih-oh)/2`
        : `scale=w=${String(container.rasterWidth)}:h=${String(container.rasterHeight)}:force_original_aspect_ratio=decrease:flags=bilinear,pad=w=${String(container.rasterWidth)}:h=${String(container.rasterHeight)}:x=(ow-iw)/2:y=(oh-ih)/2:color=black`;

    chains.push(
      `[${String(index)}:v:0]trim=start=0:end=${numberForFilter(clipDuration)},setpts=PTS-STARTPTS,fps=fps=${String(fps)}:start_time=0:round=near,${fitFilter},setsar=1,tpad=start=${String(freezeFrameCount)}:start_mode=clone:stop=-1:stop_mode=clone,trim=end_frame=${String(totalFrames)},setpts=N/(${String(fps)}*TB),format=rgb24[video${String(index)}]`,
    );
  });

  let currentOutput = "background";
  config.videos.forEach((_, index) => {
    const container = containers[index];
    const nextOutput = `videoComposite${String(index)}`;
    chains.push(
      `[${currentOutput}][video${String(index)}]overlay=x=${String(container.rasterX)}:y=${String(container.rasterY)}:eval=init:shortest=1:format=rgb[${nextOutput}]`,
    );
    currentOutput = nextOutput;
  });

  if (timerOverlay && timerInputIndex !== null) {
    chains.push(`[${String(timerInputIndex)}:v:0]setpts=N/(${String(fps)}*TB),format=rgba[timerSource]`);

    if (timerOverlay.segments.length > 1) {
      const splitOutputs = timerOverlay.segments.map((_, index) => `[timerSplit${String(index)}]`).join("");
      chains.push(`[timerSource]split=${String(timerOverlay.segments.length)}${splitOutputs}`);
    }

    timerOverlay.segments.forEach((segment, index) => {
      const source = timerOverlay.segments.length === 1 ? "timerSource" : `timerSplit${String(index)}`;
      const croppedTimer = `timerCropped${String(index)}`;
      const nextOutput = `timerComposite${String(index)}`;
      chains.push(
        `[${source}]crop=w=${String(segment.width)}:h=${String(segment.height)}:x=${String(segment.packedX)}:y=0[${croppedTimer}]`,
      );
      chains.push(
        `[${currentOutput}][${croppedTimer}]overlay=x=${String(segment.originX)}:y=${String(segment.originY)}:eval=init:shortest=1:format=rgb:alpha=straight[${nextOutput}]`,
      );
      currentOutput = nextOutput;
    });
  }

  labelInputs.forEach((label, index) => {
    const labelSource = `labelSource${String(index)}`;
    const nextOutput = `labelComposite${String(index)}`;
    chains.push(`[${String(label.inputIndex)}:v:0]setpts=N/(${String(fps)}*TB),format=rgba[${labelSource}]`);
    chains.push(
      `[${currentOutput}][${labelSource}]overlay=x=${String(label.x)}:y=${String(label.y)}:eval=init:shortest=1:format=rgb:alpha=straight[${nextOutput}]`,
    );
    currentOutput = nextOutput;
  });

  chains.push(`[${currentOutput}]format=yuv420p[output]`);
  return chains.join(";\n");
}

async function writeWithBackpressure(stream: NodeJS.WritableStream, buffer: Buffer) {
  if (stream.write(buffer)) return;
  await once(stream, "drain");
}

async function writeTimerFrames(
  child: ChildProcessWithoutNullStreams,
  timerOverlay: TimerOverlay,
  config: ExportConfig,
  longestVideoIndex: number,
  totalFrames: number,
  fps: number,
  job: ExportJob,
) {
  const canvas = new Canvas(timerOverlay.width, timerOverlay.height);
  canvas.gpu = false;
  const ctx = canvas.getContext("2d");
  configureOverlayContext(ctx);

  try {
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (isExportCanceled(job) || child.stdin.destroyed) break;
      ctx.clearRect(0, 0, timerOverlay.width, timerOverlay.height);

      timerOverlay.segments.forEach((segment) => {
        const timerText = getTimerText(config, longestVideoIndex, segment.videoIndex, frameIndex, fps);
        if (!timerText) return;

        const timerWidth = ctx.measureText(timerText).width + 60;
        const globalX = segment.container.x + (segment.container.width - timerWidth) / 2;
        const localX = segment.packedX + globalX - segment.originX;
        const localY = segment.container.y - segment.originY;

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.roundRect(localX, localY, timerWidth, OVERLAY_HEIGHT, [0, 0, 20, 20]);
        ctx.fill();
        ctx.fillStyle = "#6eff5e";
        ctx.fillText(timerText, localX + timerWidth / 2, localY + OVERLAY_HEIGHT / 2);
      });

      const buffer = canvas.toBufferSync("raw", { colorType: "rgba" });
      await writeWithBackpressure(child.stdin, buffer);
    }
  } finally {
    if (!child.stdin.destroyed) child.stdin.end();
  }
}

function monitorFfmpeg(child: ChildProcessWithoutNullStreams, totalFrames: number, onChange: (num: number) => void) {
  return new Promise<FfmpegResult>((resolve) => {
    let stdoutBuffer = "";
    let stderr = "";
    let spawnError: Error | null = null;

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdoutBuffer += chunk;
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() ?? "";
      lines.forEach((line) => {
        if (!line.startsWith("frame=")) return;
        const frame = Number(line.slice("frame=".length));
        if (!Number.isFinite(frame)) return;
        onChange(Math.min(99.9, (frame / totalFrames) * 100));
      });
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr = (stderr + chunk).slice(-MAX_FFMPEG_ERROR_LENGTH);
    });

    child.on("error", (error) => {
      spawnError = error;
    });
    child.on("close", (code, signal) => {
      resolve({ code, signal, stderr, spawnError });
    });
  });
}

function ffmpegErrorMessage(result: FfmpegResult) {
  if (result.spawnError) return `Could not start FFmpeg: ${result.spawnError.message}`;
  const details = result.stderr.trim();
  const exitDescription = result.signal ? `signal ${result.signal}` : `exit code ${String(result.code)}`;
  return details ? `FFmpeg failed with ${exitDescription}: ${details}` : `FFmpeg failed with ${exitDescription}.`;
}

export async function runFfmpegPipeline(
  filePaths: string[],
  config: ExportConfig,
  job: ExportJob,
  onChange: (num: number) => void,
) {
  validateInputs(filePaths, config, job);
  if (isExportCanceled(job)) return;

  const outputPath = job.outputPath;
  if (!outputPath) throw new Error("Missing output path for export job.");

  registerOutfitFont();

  const { width: requestedWidth, height: requestedHeight } = getCanvasDimensions(config.layout, config.videos.length);
  const outputWidth = Math.floor(requestedWidth);
  const outputHeight = Math.floor(requestedHeight);
  if (outputWidth % 2 !== 0 || outputHeight % 2 !== 0) {
    throw new Error(`The ${String(outputWidth)}x${String(outputHeight)} layout cannot be encoded as H.264.`);
  }

  const fps = config.videos.every((video) => video.framerate < 31) ? 30 : 60;
  const freezeFrameCount = Math.round(config.freezeFrameTime * fps);
  const maxVideoDuration = Math.max(...config.videos.map((video) => video.times.end - video.times.start));
  const maxDuration = maxVideoDuration + 2 * config.freezeFrameTime;
  const totalFrames = Math.round(maxDuration * fps) + 1;
  const longestVideoIndex = getLongestVideoIndex(config);
  const containers = getContainers(config.layout, config.videos.length, requestedWidth, requestedHeight);
  const rasterContainers = rasterizeContainers(containers, outputWidth, outputHeight);
  const exportDirectory = dirname(outputPath);
  await mkdir(exportDirectory, { recursive: true });

  const measureCanvas = new Canvas(1, 1);
  measureCanvas.gpu = false;
  const measureContext = measureCanvas.getContext("2d");
  configureOverlayContext(measureContext);

  const labelOverlays = await createLabelOverlays(config, containers, measureContext, exportDirectory);
  const labelInputs = labelOverlays.map((label, index) => ({
    ...label,
    inputIndex: filePaths.length + index,
  }));
  const timerOverlay = createTimerOverlay(config, containers, longestVideoIndex, totalFrames, fps, measureContext);
  const timerInputIndex = timerOverlay ? filePaths.length + labelInputs.length : null;
  const filterGraph = buildFilterGraph(
    config,
    rasterContainers,
    outputWidth,
    outputHeight,
    fps,
    freezeFrameCount,
    totalFrames,
    labelInputs,
    timerOverlay,
    timerInputIndex,
  );
  const filterGraphPath = join(exportDirectory, "filter-graph.txt");
  await writeFile(filterGraphPath, filterGraph, "utf8");

  const ffmpegPath = process.env.FFMPEG_PATH ?? ffmpegStatic;
  if (!ffmpegPath) {
    throw new Error("FFmpeg is unavailable on this platform. Set FFMPEG_PATH to an FFmpeg executable.");
  }

  const args = ["-hide_banner", "-nostdin", "-y", "-loglevel", "warning", "-filter_complex_threads", "2"];
  config.videos.forEach((video, index) => {
    const inputStartTime = Math.max(0, video.times.start - (video.sourceTimeOffset ?? 0));
    args.push("-ss", numberForFilter(inputStartTime), "-i", filePaths[index]);
  });
  labelInputs.forEach((label) => {
    args.push("-loop", "1", "-framerate", String(fps), "-i", label.path);
  });
  if (timerOverlay) {
    args.push(
      "-f",
      "rawvideo",
      "-pixel_format",
      "rgba",
      "-video_size",
      `${String(timerOverlay.width)}x${String(timerOverlay.height)}`,
      "-framerate",
      String(fps),
      "-i",
      "pipe:0",
    );
  }
  args.push(
    "-filter_complex_script",
    filterGraphPath,
    "-map",
    "[output]",
    "-frames:v",
    String(totalFrames),
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-b:v",
    OUTPUT_BITRATE,
    "-minrate",
    OUTPUT_BITRATE,
    "-maxrate",
    OUTPUT_BITRATE,
    "-bufsize",
    "10000k",
    "-threads",
    "4",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(fps),
    "-fps_mode",
    "cfr",
    "-movflags",
    "+faststart",
    "-map_metadata",
    "-1",
    "-map_chapters",
    "-1",
    "-progress",
    "pipe:1",
    "-nostats",
    outputPath,
  );

  const child = spawn(ffmpegPath, args, { stdio: ["pipe", "pipe", "pipe"] });
  // A failed/terminated FFmpeg process closes its input pipe before Node can
  // finish writing timer frames. The process result below remains the source
  // of the actionable error, while this listener prevents an unhandled EPIPE.
  child.stdin.on("error", () => undefined);
  if (!timerOverlay) child.stdin.end();

  const cancelWatcher = setInterval(() => {
    if (isExportCanceled(job) && child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM");
    }
  }, 100);

  const processPromise = monitorFfmpeg(child, totalFrames, onChange);
  let timerError: unknown = null;
  const timerPromise = timerOverlay
    ? writeTimerFrames(child, timerOverlay, config, longestVideoIndex, totalFrames, fps, job).catch(
        (error: unknown) => {
          timerError = error;
          if (!child.stdin.destroyed) child.stdin.destroy();
        },
      )
    : Promise.resolve();

  try {
    const result = await processPromise;
    await timerPromise;
    if (isExportCanceled(job)) return;
    if (result.code !== 0) throw new Error(ffmpegErrorMessage(result));
    if (timerError instanceof Error) throw timerError;
    if (typeof timerError === "string") throw new Error(timerError);
    if (timerError !== null) throw new Error("The timer overlay stream failed.");
  } finally {
    clearInterval(cancelWatcher);
    if (!child.stdin.destroyed && !child.stdin.writableEnded) child.stdin.destroy();
  }
}
