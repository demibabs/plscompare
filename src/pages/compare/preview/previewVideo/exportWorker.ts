import {
  Input,
  UrlSource,
  ALL_FORMATS,
  VideoSampleSink,
  Output,
  Mp4OutputFormat,
  BufferTarget,
  CanvasSource,
} from "mediabunny";

import { renderFrame } from "./renderFrame";
import type { ExportConfig } from "./useVideoExport";
import { formatSecondsToSSMS } from "../../../../utils/formatMsToSSMS";
import { getCanvasDimensions } from "../../../../utils/getCanvasDimensions";

let isCanceled = false;

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === "START_EXPORT") {
    try {
      await runMediabunnyPipeline(e.data.payload);
    } catch (err) {
      self.postMessage({ type: "ERROR", error: (err as Error).message });
    }
  }
  if (e.data.type === "CANCEL") isCanceled = true;
};

async function runMediabunnyPipeline(config: ExportConfig) {
  const { videos, freezeFrameTime, layout } = config;
  const canvasDimensions = getCanvasDimensions(layout, videos.length);
  const fps = videos.every(v => v.framerate < 31) ? 30 : 60;
  const frameDurationSec = 1 / fps;

  try {
    const absoluteFontUrl = new URL("/fonts/Outfit-VariableFont_wght.woff2", self.location.origin).href;
    const customFont = new FontFace("Outfit", `url(${absoluteFontUrl})`);

    await customFont.load();
    self.fonts.add(customFont);
  } catch (err) {
    console.warn("Could not load local font:", err);
  }

  const canvas = new OffscreenCanvas(canvasDimensions.width, canvasDimensions.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  // 1. Initialize Inputs & Sinks using UrlSource (Streams directly instead of downloading Blobs)
  const sinks = await Promise.all(
    videos.map(async (video) => {
      const input = new Input({
        source: new UrlSource(video.url),
        formats: ALL_FORMATS,
      });

      const videoTrack = await input.getPrimaryVideoTrack();
      if (!videoTrack) throw new Error("Missing video track in source");

      const decodable = await videoTrack.canDecode();
      if (!decodable) throw new Error("Video track cannot be decoded");

      // Explicitly request hardware acceleration
      return new VideoSampleSink(videoTrack, { hardwareAcceleration: "prefer-hardware" });
    }),
  );

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: target,
  });

  const outVideoSource = new CanvasSource(canvas, {
    codec: "avc",
    bitrate: 5_000_000,
    bitrateMode: "constant",
    latencyMode: "quality",
  } as any);

  output.addVideoTrack(outVideoSource, { frameRate: fps });
  await output.start();

  const maxDuration = Math.max(...videos.map((v) => v.times.end - v.times.start)) + 2 * freezeFrameTime;
  const totalFrames = Math.round(maxDuration * fps) + 1; // + 1 to include the final boundary frame

  const longestVideoIndex = videos.reduce((maxIndex, _, index) => {
    const { start, end } = videos[index].times;
    const { start: maxStart, end: maxEnd } = videos[maxIndex].times;
    return end - start >= maxEnd - maxStart ? index : maxIndex;
  }, 0);

  // 2. Pre-fill Stream Iterators
  // Create a forward-reading state machine for each video rather than seeking.
  const streams = await Promise.all(
    sinks.map(async (sink, index) => {
      const video = videos[index];
      const iterator = sink.samples(video.times.start)[Symbol.asyncIterator]();

      const firstRes = await iterator.next();
      const state = {
        iterator,
        currentSample: firstRes.value || null,
        nextSample: null as any,
        isDone: firstRes.done,
      };

      // Peek at the second sample so we know exactly when to advance the frame
      if (!state.isDone) {
        const secondRes = await iterator.next();
        state.nextSample = secondRes.value || null;
        state.isDone = secondRes.done;
      }

      return state;
    }),
  );

  // 3. The Main Compositing Loop
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (isCanceled) break;

    const currentTimestampSec = frameIndex * frameDurationSec;
    const timerTimes = [...Array(videos.length)];

    // A. Advance iterators only when necessary
    for (let i = 0; i < streams.length; i++) {
      const state = streams[i];
      const video = videos[i];

      const EPSILON = 0.001;
      const sourceTime = Math.max(video.times.start + currentTimestampSec - freezeFrameTime, video.times.start);

      // Handle custom timer text math
      if (sourceTime > video.times.end + EPSILON) {
        if (i !== longestVideoIndex) {
          const videoDuration = videos[i].times.end - videos[i].times.start;
          const longestDuration = videos[longestVideoIndex].times.end - videos[longestVideoIndex].times.start;
          timerTimes[i] = Math.min(sourceTime - video.times.end, longestDuration - videoDuration);
        }
      }

      // Advance the frame if needed, clamping to the end time so we always hit the final frame
      const targetTime = Math.min(sourceTime, video.times.end);
      // Fast-forward the stream until the *next* sample is in the future.
      // This natively handles differing framerates and freeze frames without redundant decoding.
      while (!state.isDone && state.nextSample && state.nextSample.timestamp <= targetTime + frameDurationSec / 2) {
        if (state.currentSample) state.currentSample.close(); // Free old sample
        state.currentSample = state.nextSample;

        const nextRes = await state.iterator.next();
        state.nextSample = nextRes.value || null;
        state.isDone = nextRes.done;
      }
    }

    // B. Prepare sources for rendering
    // toVideoFrame() clones the handle. We can safely close it after rendering without losing our cached currentSample.
    const sources = streams.map((s) => (s.currentSample ? s.currentSample.toVideoFrame() : null));
    const sourcesDimensions = streams.map((s) =>
      s.currentSample
        ? {
            width: s.currentSample.displayWidth,
            height: s.currentSample.displayHeight,
          }
        : { width: 0, height: 0 },
    );

    const labelsText = videos.map((v) => v.label);
    const timersText = timerTimes.map((tTime) => (tTime !== undefined ? formatSecondsToSSMS(tTime) : ""));

    // C. Draw the layout
    renderFrame(ctx, layout, sources, sourcesDimensions, labelsText, timersText);

    // D. Encode
    await outVideoSource.add(currentTimestampSec, frameDurationSec);

    // E. Iteration Cleanup
    // Close the cloned VideoFrames to prevent GPU memory leaks.
    // DO NOT close the inner samples here, as we need them persisting for freeze frames.
    sources.forEach((s) => {
      if (s) s.close();
    });

    if (frameIndex % 10 === 0) {
      const progress = (frameIndex / totalFrames) * 100;
      self.postMessage({ type: "PROGRESS", progress });
    }
  }

  // 4. Final Cleanup
  streams.forEach((state) => {
    if (state.currentSample) state.currentSample.close();
    if (state.nextSample) state.nextSample.close();
  });

  await output.finalize();
  const finalBuffer = target.buffer;

  if (!finalBuffer) {
    self.postMessage({ type: "ERROR", error: "Export resulted in an empty buffer." });
    return;
  }

  if (isCanceled) return;

  const workerScope = self as unknown as DedicatedWorkerGlobalScope;
  workerScope.postMessage({ type: "SUCCESS", buffer: finalBuffer }, [finalBuffer]);
}
