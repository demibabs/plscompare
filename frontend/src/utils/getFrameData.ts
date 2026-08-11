import { ALL_FORMATS, BlobSource, Input, VideoSampleSink } from "mediabunny";

export type FrameData = {framerate: number, allFrameTimes: number[]}
export async function getFrameData(file: File, onProgress: (num: number) => void) {
  const allFrameTimes: number[] = [];
  let framerate = 0;
  // Initialize your media input
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const videoTrack = await input.getPrimaryVideoTrack();

  try {
    if (videoTrack) {
      const packetStats = await videoTrack.computePacketStats(200);
      framerate = packetStats.averagePacketRate;

      const sink = new VideoSampleSink(videoTrack);
      const duration = await videoTrack.getDurationFromMetadata()
      let lastEndTime = 0;
      for await (const sample of sink.samples()) {
        allFrameTimes.push(sample.timestamp);
        lastEndTime = sample.timestamp + sample.duration;
        onProgress(Math.min(lastEndTime / (duration ?? Infinity), 1))
        sample.close();
      }
      if (allFrameTimes.length > 0) {
        allFrameTimes.push(lastEndTime);
      }
    }
    onProgress(1)
    return { allFrameTimes, framerate };
  } finally {
    input.dispose();
  }
}
