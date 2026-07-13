import { useEffect, useRef, useState } from "react";
import type { FileData, VideoData } from "../../sideBySideEditor/SideBySideEditor";
import { cn } from "../../../../utils/cn";

type Dimensions = { width: number; height: number };
type Layout = "default";

export function PreviewVideo({ filesData, videosData }: { filesData: FileData[]; videosData: VideoData[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videosRef = useRef<HTMLVideoElement[]>(Array(filesData.length).fill(null));
  const [isInFreezeFrame, setIsInFreezeFrame] = useState(false);
  const timerRef = useRef<number>(undefined);
  const freezeFrameTime = 2;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const request = useRef<number>(0);
  const layout: Layout = "default";
  const hasEndFreezeFramed = useRef(false);

  const canvasDimensions: Dimensions = { width: 1920, height: 1080 };

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
              const displayWidth = canvasDimensions.width / videosDimensions.length;
              const sourceX = (vDims.width - displayWidth) / 2;
              const destX = displayWidth * index;
              ctx.drawImage(
                videosRef.current[index],
                sourceX,
                0,
                displayWidth,
                vDims.height,
                destX,
                0,
                displayWidth,
                vDims.height,
              );
            });
          }
        }
      }
      if (loop) request.current = requestAnimationFrame(() => renderFrame(loop));
    }
  }

  useEffect(() => {
    if (isPlaying) {
      request.current = requestAnimationFrame(() => renderFrame(true));
      if (videosRef.current.every((vElement) => vElement.ended)) {
        videosRef.current.forEach((vElement) => vElement.play());
      } else {
        videosRef.current.forEach((vElement) => {
          if (!vElement.ended) vElement.play();
        });
      }
    } else {
      cancelAnimationFrame(request.current);
      videosRef.current.forEach((vElement) => vElement.pause());
    }
    return () => cancelAnimationFrame(request.current);
  }, [isPlaying]);

  function playFreezeFrame() {
    setIsInFreezeFrame(true);
    timerRef.current = setTimeout(() => {
      setIsInFreezeFrame(false);
      setIsPlaying(!isPlaying);
    }, freezeFrameTime * 1000);
  }

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="skeleton border-base-300 rounded-box my-5 aspect-video w-2xl border-3"
        width={1920}
        height={1080}
      >
        {filesData.map((fData, index) => (
          <video
            className="absolute size-0 opacity-0"
            preload="auto"
            key={fData.id}
            src={fData.url}
            ref={(e) => {
              if (e) videosRef.current[index] = e;
            }}
            onLoadedMetadata={() => (videosRef.current[index].currentTime = videosData[index].times.start)}
            onCanPlayThrough={() => {
              if (videosRef.current.every((vElement) => vElement.readyState === 4)) {
                setCanPlay(true);
              }
            }}
            onTimeUpdate={() => {
              if (videosRef.current[index].currentTime < videosData[index].times.start) {
                videosRef.current[index].currentTime = videosData[index].times.start;
              }
              if (videosRef.current[index].currentTime >= videosData[index].times.end) {
                videosRef.current[index].currentTime = videosData[index].times.end;
                if (videosRef.current.every((vElement, index) => vElement.currentTime >= videosData[index].times.end)) {
                  if (isPlaying) playFreezeFrame();
                }
              }
            }}
            onEnded={() => {
              if (videosRef.current.every((vElement) => vElement.ended)) {
                setIsPlaying(false);
              }
            }}
            onSeeked={() => {
              renderFrame(false);
            }}
          />
        ))}
      </canvas>{" "}
      <button
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current);

          console.log(videosRef.current.map((vElement) => vElement.currentTime));

          if (isPlaying) setIsPlaying(false);
          else {
            if (videosRef.current[0].currentTime <= videosData[0].times.start + 0.02) {
              playFreezeFrame();
            } else if (
              videosRef.current.every((vElement, index) => vElement.currentTime >= videosData[index].times.end)
            ) {
              videosRef.current.forEach((vElement, index) => (vElement.currentTime = videosData[index].times.start));
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
  );
}
