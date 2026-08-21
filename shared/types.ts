import type { Layout } from "./renderFrame";

export type ExportConfig = {
  videos: {
    times: { start: number; end: number };
    label: string | null;
    framerate: number;
    /** Original-source timestamp corresponding to FFmpeg seek time zero in the uploaded clip. */
    sourceTimeOffset?: number;
  }[];
  fileName: string;
  freezeFrameTime: number;
  layout: Layout;
};
