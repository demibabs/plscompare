import type { VideoData } from "../pages/compare/sideBySideEditor/SideBySideEditor";

export type VideoDataReady = {
  label: string | null;
  times: {
    start: number;
    end: number;
  };
};

export function hasTimes(vData: VideoData): vData is VideoDataReady {
  return vData.times.start !== null && vData.times.end !== null;
}
