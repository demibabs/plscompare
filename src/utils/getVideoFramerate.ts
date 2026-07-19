import * as MP4Box from "mp4box";

type Mp4Track = {
  duration: number;
  nb_samples: number;
  timescale: number;
  type?: "audio" | "video" | "subtitles" | "metadata";
};

type Mp4Info = {
  tracks: Mp4Track[];
};

type Mp4Buffer = ArrayBuffer & {
  fileStart: number;
};

export function getVideoFramerate(file: File): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const mp4boxfile = MP4Box.createFile();

    mp4boxfile.onReady = (info: Mp4Info) => {
      const videoTrack = info.tracks.find((track) => track.type === "video");
      if (videoTrack) {
        const durationInSeconds = videoTrack.duration / videoTrack.timescale;
        const fps = videoTrack.nb_samples / durationInSeconds;
        resolve(Math.round(fps * 100) / 100);
      } else {
        reject(new Error("No video track found"));
      }
    };

    mp4boxfile.onError = (error: unknown) => reject(error);

    void file
      .arrayBuffer()
      .then((arrayBuffer) => {
        const mp4Buffer = arrayBuffer as Mp4Buffer;
        mp4Buffer.fileStart = 0;
        mp4boxfile.appendBuffer(mp4Buffer);
        mp4boxfile.flush();
      })
      .catch(reject);
  });
}
