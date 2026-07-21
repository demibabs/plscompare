import { ALL_FORMATS, BlobSource, Input, VideoSampleSink } from "mediabunny";

export type FrameData = {framerate: number, allFrameTimes: number[]}
export async function getFrameData(file: File) {
  const allFrameTimes = [0];
  let framerate = 0;
  // Initialize your media input
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const videoTrack = await input.getPrimaryVideoTrack();

  try {
    if (videoTrack) {
      const packetStats = await videoTrack.computePacketStats(200);
      framerate = packetStats.averagePacketRate;

      const sink = new VideoSampleSink(videoTrack);
      for await (const sample of sink.samples()) {
        const endTime = sample.timestamp + sample.duration;

        allFrameTimes.push(endTime);
        sample.close();
      }
    }
    return { allFrameTimes, framerate };
  } finally {
    input.dispose();
  }
}
