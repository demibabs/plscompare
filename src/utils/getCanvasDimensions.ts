import type { Dimensions, Layout } from "../pages/compare/preview/previewVideo/renderFrame";

export function getCanvasDimensions(layout: Layout, numVideos: number): Dimensions {
  let width = 1920;
  let height = 1080;
  switch (layout) {
    case "vertical": {
      height *= numVideos;
      break;
    }
    case "horizontal": {
      width *= numVideos;
      break;
    }
  }
  return { width, height };
}
