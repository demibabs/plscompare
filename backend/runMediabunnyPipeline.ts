import {
  Input,
  ALL_FORMATS,
  VideoSampleSink,
  Output,
  Mp4OutputFormat,
  BufferTarget,
  VideoSample,
  FilePathSource,
  VideoSampleSource,
  FilePathTarget,
} from "mediabunny";

import { renderFrame } from "@plscompare/shared/renderFrame";
import type { ExportConfig } from "@plscompare/shared/types";
import { formatSecondsToSSMS } from "@plscompare/shared/formatSecondsToSSMS";
import { getCanvasDimensions } from "@plscompare/shared/getCanvasDimensions";
import { Canvas } from "skia-canvas";
import { tmpdir } from "node:os";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ExportJob } from "./exportJobs";

type StreamState = {
  iterator: AsyncIterator<VideoSample, void>;
  currentSample: VideoSample | null;
  nextSample: VideoSample | null;
  isDone: boolean;
};

export async function runMediabunnyPipeline(
  filePaths: string[],
  config: ExportConfig,
  job: ExportJob,
  onChange: (num: number) => void,
) {
  const { videos, freezeFrameTime, layout } = config;
  const canvasDimensions = getCanvasDimensions(layout, videos.length);
  const fps = videos.every((v) => v.framerate < 31) ? 30 : 60;
  const frameDurationSec = 1 / fps;

  const canvas = new Canvas(canvasDimensions.width, canvasDimensions.height);
  canvas.gpu = false;
  const ctx = canvas.getContext("2d");

  const inputs: Input[] = [];
  let streams: StreamState[] = [];

  try {
    // 1. Initialize Inputs & Sinks using UrlSource (Streams directly instead of downloading Blobs)
    const sinks = await Promise.all(
      videos.map(async (_, index) => {
        const input = new Input({
          source: new FilePathSource(filePaths[index]),
          formats: ALL_FORMATS,
        });
        inputs.push(input);

        const videoTrack = await input.getPrimaryVideoTrack();
        if (!videoTrack) throw new Error("Missing video track in source");

        const decodable = await videoTrack.canDecode();
        if (!decodable) throw new Error("Video track cannot be decoded");

        return new VideoSampleSink(videoTrack, { hardwareAcceleration: "prefer-software" });
      }),
    );

    const exportDirectory = join(tmpdir(), "exports", job.id);
    await mkdir(exportDirectory, { recursive: true });
    const outputPath = join(exportDirectory, `output.mp4`);

    const target = new FilePathTarget(outputPath);
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: target,
    });

    const outVideoSource = new VideoSampleSource({
      codec: "avc",
      bitrate: 5_000_000,
      bitrateMode: "constant",
      latencyMode: "quality",
      hardwareAcceleration: "prefer-software",
    });

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
    streams = await Promise.all(
      sinks.map(async (sink, index) => {
        const video = videos[index];
        const iterator = sink.samples(video.times.start)[Symbol.asyncIterator]();

        const firstRes = await iterator.next();
        const state: StreamState = {
          iterator,
          currentSample: firstRes.value ?? null,
          nextSample: null,
          isDone: firstRes.done ?? false,
        };

        // Peek at the second sample so we know exactly when to advance the frame
        if (!state.isDone) {
          const secondRes = await iterator.next();
          state.nextSample = secondRes.value ?? null;
          state.isDone = secondRes.done ?? false;
        }

        return state;
      }),
    );

    const sourceFrames = streams.map((state) => {
      const sample = state.currentSample;

      if (!sample) {
        throw new Error("Missing initial video sample");
      }

      const width = sample.displayWidth;
      const height = sample.displayHeight;
      const imageData = ctx.createImageData(width, height);

      return {
        imageData,
        width,
        height,
      };
    });

    // 3. The Main Compositing Loop
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (job.status === "canceled") break;

      const currentTimestampSec = frameIndex * frameDurationSec;
      const timerTimes: (number | undefined)[] = Array.from({ length: videos.length });

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
        while (!state.isDone && state.nextSample && state.nextSample.timestamp <= targetTime + 0.005) {
          if (state.currentSample) state.currentSample.close(); // Free old sample
          state.currentSample = state.nextSample;

          const nextRes = await state.iterator.next();
          state.nextSample = nextRes.value ?? null;
          state.isDone = nextRes.done ?? false;
        }
      }

      // B. Prepare sources for rendering
      await Promise.all(
        streams.map(async (state, index) => {
          const sample = state.currentSample;
          const sourceFrame = sourceFrames[index];
          if (!sample) return;
          await sample.copyTo(sourceFrame.imageData.data, {
            format: "RGBA",
          });
        }),
      );
      const sources = sourceFrames.map((sourceFrame) => sourceFrame.imageData);
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
      renderFrame(
        ctx as unknown as CanvasRenderingContext2D,
        layout,
        sources as unknown as CanvasImageSource[],
        sourcesDimensions,
        labelsText,
        timersText,
      );

      const imageData = canvas.getContext("2d").getImageData(0, 0, canvasDimensions.width, canvasDimensions.height);

      const sample = new VideoSample(imageData.data, {
        format: "RGBA",
        codedWidth: canvasDimensions.width,
        codedHeight: canvasDimensions.height,
        timestamp: currentTimestampSec,
        duration: frameDurationSec,
      });

      // D. Encode
      await outVideoSource.add(sample);
      sample.close();

      if (frameIndex % 10 === 0) {
        const progress = (frameIndex / totalFrames) * 100;
        onChange(progress);
      }
    }

    if (job.status === "canceled") {
      await output.cancel();
      return;
    }

    await output.finalize();

    return outputPath;
  } finally {
    // 4. Final Cleanup
    // Iterate over streams to ensure any fetched but unprocessed samples are closed,
    // and the iterator gets a return signal which allows the sink to cleanup internal buffers.
    for (const state of streams) {
      if (state.currentSample) {
        try {
          state.currentSample.close();
        } catch {
          /* ignore */
        }
      }
      if (state.nextSample) {
        try {
          state.nextSample.close();
        } catch {
          /* ignore */
        }
      }
      if (typeof state.iterator.return === "function") {
        try {
          await state.iterator.return();
        } catch {
          /* ignore */
        }
      }
    }

    // Dispose of inputs to release system resources (decoders, demuxers)
    for (const input of inputs) {
      try {
        input.dispose();
      } catch {
        /* ignore */
      }
    }
  }
}
