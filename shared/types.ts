import type { Layout } from "./renderFrame"

export type ExportConfig = {
  videos: { times: { start: number; end: number }; label: string | null; framerate: number }[];
  fileName: string;
  freezeFrameTime: number;
  layout: Layout;
};