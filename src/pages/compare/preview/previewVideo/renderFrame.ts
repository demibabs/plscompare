export type Layout = "default";
export type Dimensions = { width: number; height: number };

export function renderFrame(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  canvasDimensions: Dimensions,
  layout: Layout,
  sources: (CanvasImageSource | null)[],
  sourcesDimensions: Dimensions[],
  labelsText: (string | null)[],
  timersText: string[],
) {
  if (sourcesDimensions.every((sDims, index) => sources[index] && sDims.width && sDims.height)) {
    let sourceX: number;
    let sourceY: number;
    let sourceWidth: number;
    let sourceHeight: number;
    let destX: number;
    let destY: number;
    let destWidth: number;
    let destHeight: number;
    const fontSize = 72;
    ctx.font = fontSize + "px Outfit";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    sourcesDimensions.forEach((sDims, index) => {
      if (layout === "default") {
        // 1. Define our destination dimensions
        destWidth = canvasDimensions.width / sourcesDimensions.length;
        destHeight = canvasDimensions.height;

        // 2. Calculate aspect ratios
        const targetAspectRatio = destWidth / destHeight;
        const videoAspectRatio = sDims.width / sDims.height;
        // 3. Determine how to crop based on ratios
        if (videoAspectRatio > targetAspectRatio) {
          // Video is wider than our target box -> crop the sides
          sourceHeight = sDims.height;
          sourceWidth = sourceHeight * targetAspectRatio;
          sourceX = (sDims.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          // Video is taller than our target box -> crop the top and bottom
          sourceWidth = sDims.width;
          sourceHeight = sourceWidth / targetAspectRatio;
          sourceX = 0;
          sourceY = (sDims.height - sourceHeight) / 2;
        }
        destX = destWidth * index;
        destY = 0;
        // 4. Draw to canvas
        ctx.drawImage(
          sources[index] as CanvasImageSource,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          destX,
          destY,
          destWidth,
          destHeight,
        );
      }
      if (timersText[index].length > 0) {
        const timerText = timersText[index];
        const textWidth = ctx.measureText(timerText).width;
        const timerWidth = textWidth + 60;
        const timerHeight = fontSize + 60;
        const timerX = index * destWidth + (destWidth - timerWidth) / 2;
        const timerY = destY;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.roundRect(timerX, timerY, timerWidth, timerHeight, [0, 0, 20, 20]);
        ctx.fill();
        ctx.fillStyle = "#6eff5e";
        const centerX = timerX + timerWidth / 2;
        const centerY = timerY + timerHeight / 2;
        ctx.fillText(timerText, centerX, centerY);
      }
      const labelText = labelsText[index];
      if (labelText && labelText.length > 0) {
        const labelTextWidth = ctx.measureText(labelText).width;
        const labelWidth = labelTextWidth + 60;
        const labelHeight = fontSize + 60;
        const labelX = index * destWidth + (destWidth - labelWidth) / 2;
        const labelY = destY + destHeight - labelHeight;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, labelWidth, labelHeight, [20, 20, 0, 0]);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        const centerX = labelX + labelWidth / 2;
        const centerY = labelY + labelHeight / 2;
        ctx.fillText(labelText, centerX, centerY);
      }
    });
  }
}
