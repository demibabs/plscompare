import type { Dimensions, Layout } from "../pages/compare/preview/previewVideo/renderFrame";
import { getGridDimensions } from "../pages/compare/preview/previewVideo/renderFrame";

export function getCanvasDimensions(layout: Layout, numVideos: number): Dimensions {
  let width;
  let height;
  switch (layout) {
    case "default": {
      width = 1920;
      height = 1080;
      break
    }
    case "vertical": {
      width = 3840 / numVideos;
      height = 2160;
      break
    }
    case "horizontal": {
      width = 3840
      height = 2160 / numVideos
      break;
    }
    case "grid": {
      const { rows, cols } = getGridDimensions(numVideos);
      if (rows === cols) {
        width = 3840;
        height = 2160;
      } else {
        // cols > rows (rectangular): scale down the height axis
        width = 3840;
        height = 2160 * rows / cols;
      }
      break;
    }
  }
  return { width, height };
}

