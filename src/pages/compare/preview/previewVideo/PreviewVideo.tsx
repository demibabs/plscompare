import { useEffect, useRef, useState } from "react";
import type { FileData, VideoData } from "../../sideBySideEditor/SideBySideEditor";
import { cn } from "../../../../utils/cn";
import { formatSecondsToSSMS } from "../../../../utils/formatMsToSSMS";

type Dimensions = { width: number; height: number };
type Layout = "default";

type VideoDataReady = {
  label: string | null;
  times: {
    start: number;
    end: number;
  };
};

function hasTimes(vData: VideoData): vData is VideoDataReady {
  return vData.times.start !== null && vData.times.end !== null;
}

export function PreviewVideo({ filesData, videosData }: { filesData: FileData[]; videosData: VideoData[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videosRef = useRef<HTMLVideoElement[]>(Array(filesData.length).fill(null));
  const [isInFreezeFrame, setIsInFreezeFrame] = useState(false);
  const timerRef = useRef<number>(undefined);
  const freezeFrameTime = 2;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const request = useRef<number>(0);
  const requests = useRef<number[]>(Array(videosData.length).fill(undefined));
  const layout: Layout = "default";
  const mediaTimes = useRef<number[]>(videosData.map((vData) => vData.times.start as number));
  const timerStartTimes = useRef<number[]>(Array(videosData.length).fill(-1));
  const canvasDimensions: Dimensions = { width: 1920, height: 1080 };
  const longestVideoIndex = useRef(-1);

  function renderFrame(loop: boolean) {
    if (canvasRef.current && videosRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const videosDimensions: Dimensions[] = videosRef.current.map((vElement) => ({
          width: vElement.videoWidth,
          height: vElement.videoHeight,
        }));
        if (videosDimensions.every((vDims) => vDims.width && vDims.height)) {
          if (layout === "default") {
            videosDimensions.forEach((vDims, index) => {
              // 1. Define our destination dimensions
              const destWidth = canvasDimensions.width / videosDimensions.length;
              const destHeight = canvasDimensions.height;

              // 2. Calculate aspect ratios
              const targetAspectRatio = destWidth / destHeight;
              const videoAspectRatio = vDims.width / vDims.height;
              let sourceWidth, sourceHeight, sourceX, sourceY;
              // 3. Determine how to crop based on ratios
              if (videoAspectRatio > targetAspectRatio) {
                // Video is wider than our target box -> crop the sides
                sourceHeight = vDims.height;
                sourceWidth = sourceHeight * targetAspectRatio;
                sourceX = (vDims.width - sourceWidth) / 2;
                sourceY = 0;
              } else {
                // Video is taller than our target box -> crop the top and bottom
                sourceWidth = vDims.width;
                sourceHeight = sourceWidth / targetAspectRatio;
                sourceX = 0;
                sourceY = (vDims.height - sourceHeight) / 2;
              }
              const destX = destWidth * index;
              const destY = 0;
              // 4. Draw to canvas
              ctx.drawImage(
                videosRef.current[index],
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                destX,
                destY,
                destWidth,
                destHeight,
              );
              if (timerStartTimes.current[index] !== -1 && index !== longestVideoIndex.current) {
                const time =
                  mediaTimes.current[longestVideoIndex.current] -
                  (videosData[longestVideoIndex.current].times.start as number) -
                  (timerStartTimes.current[index] - (videosData[index].times.start as number));
                const timerText = formatSecondsToSSMS(time);
                ctx.font = "72px Outfit";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const textWidth = ctx.measureText(timerText).width;
                const timerHeight = 150;
                const timerWidth = Math.min(destWidth, textWidth + 80);
                const timerX = index * destWidth + (destWidth - timerWidth) / 2;
                ctx.fillStyle = "#000000";
                ctx.roundRect(timerX, 0, timerWidth, timerHeight, [0, 0, 20, 20])
                ctx.fill()
                ctx.fillStyle = "#6eff5e";
                const centerX = timerX + timerWidth / 2;
                const centerY = timerHeight / 2;
                ctx.fillText(timerText, centerX, centerY);
              }
            });
          }
        }
      }
      if (loop) request.current = requestAnimationFrame(() => renderFrame(loop));
    }
  }

  function watchVideo(vElement: HTMLVideoElement, index: number) {
    vElement.requestVideoFrameCallback((now, metadata) => {
      mediaTimes.current[index] = metadata.mediaTime;
      if (metadata.mediaTime >= (videosData[index].times.end as number)) {
        vElement.pause();
        timerStartTimes.current[index] = metadata.mediaTime;
        if (videosRef.current.every((vElement) => vElement.paused)) {
          if (isPlaying) playFreezeFrame();
        }
        return;
      }
      watchVideo(vElement, index);
    });
  }

  useEffect(() => {
    const videos = videosRef.current;
    if (isPlaying) {
      videos.forEach((vElement, index) => {
        requests.current[index] = vElement.requestVideoFrameCallback(() => watchVideo(vElement, index));
      });
      if (videosRef.current.every((vElement) => vElement.ended)) {
        videosRef.current.forEach((vElement) => vElement.play());
      } else {
        videosRef.current.forEach((vElement) => {
          if (!vElement.ended) vElement.play();
        });
      }
    } else {
      videosRef.current.forEach((vElement) => vElement.pause());
      videos.forEach((vElement, index) => {
        vElement.cancelVideoFrameCallback(requests.current[index]);
      });
    }
    return () =>
      videos.forEach((vElement, index) => {
        vElement.cancelVideoFrameCallback(requests.current[index]);
      });
  }, [isPlaying]);

  useEffect(() => {
    request.current = requestAnimationFrame(() => renderFrame(true));
    return () => cancelAnimationFrame(request.current);
  }, []);

  function playFreezeFrame() {
    setIsInFreezeFrame(true);
    timerRef.current = setTimeout(() => {
      setIsInFreezeFrame(false);
      setIsPlaying(!isPlaying);
    }, freezeFrameTime * 1000);
  }
  return (
    videosData.every((vData) => hasTimes(vData)) && (
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="skeleton border-base-300 rounded-box my-5 aspect-video w-2xl border-3"
          width={1920}
          height={1080}
        ></canvas>{" "}
        {[...Array(videosData.length)].map((_, index) => (
          <video
            className="opacity absolute size-0"
            preload="auto"
            key={index}
            src={filesData[index].url}
            ref={(e) => {
              if (e) videosRef.current[index] = e;
            }}
            onLoadedMetadata={() => (videosRef.current[index].currentTime = videosData[index].times.start)}
            onCanPlayThrough={() => {
              if (videosRef.current.every((vElement) => vElement.readyState === 4)) {
                setCanPlay(true);
                longestVideoIndex.current = videosRef.current.reduce((maxIndex, _, index) => {
                  const { start, end } = videosData[index].times;
                  const { start: maxStart, end: maxEnd } = videosData[maxIndex].times;
                  const duration = end - start;
                  const maxDuration = maxEnd - maxStart;
                  if (duration >= maxDuration) return index;
                  else return maxIndex;
                }, 0);
              }
            }}
            onTimeUpdate={() => {
              if (videosRef.current[index].currentTime < videosData[index].times.start) {
                videosRef.current[index].currentTime = videosData[index].times.start;
              }
              if (videosRef.current.every((vElement, index) => vElement.currentTime >= videosData[index].times.end)) {
                if (isPlaying) playFreezeFrame();
              }
            }}
            onEnded={() => {
              if (videosRef.current.every((vElement) => vElement.ended)) {
                setIsPlaying(false);
              }
            }}
          />
        ))}
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);

            if (isPlaying) setIsPlaying(false);
            else {
              if (videosRef.current[0].currentTime <= videosData[0].times.start + 0.02) {
                playFreezeFrame();
              } else if (
                videosRef.current.every((vElement, index) => {
                  return mediaTimes.current[index] >= videosData[index].times.end;
                })
              ) {
                videosRef.current.forEach((vElement, index) => (vElement.currentTime = videosData[index].times.start));
                timerStartTimes.current.fill(-1);
                playFreezeFrame();
              } else setIsPlaying(true);
            }
          }}
          className={cn("btn btn-xl border-base-300 btn-accent mt-5 mb-2 border-3 px-3", {
            "btn-disabled": !canPlay || isInFreezeFrame,
          })}
        >
          {isPlaying || isInFreezeFrame ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
          )}
        </button>
      </div>
    )
  );
}
