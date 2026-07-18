import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { cn } from "../../../utils/cn";
import type { FileData, Part, VideoData } from "./SideBySideEditor";

export function ScrubbableVideo({
  fileData,
  unsavedVideosData,
  setUnsavedVideosData,
  arePlaying,
  setArePlaying,
  part,
}: {
  fileData: FileData;
  unsavedVideosData: VideoData[];
  setUnsavedVideosData: Dispatch<SetStateAction<VideoData[]>>;
  arePlaying: boolean[];
  setArePlaying: Dispatch<SetStateAction<boolean[]>>;
  part: Part;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(1);
  const [hasLoadedMetadata, setHasLoadedMetadata] = useState(false);

  const { id, url, framerate } = fileData;

  const startTime = unsavedVideosData[id].times.start;
  let markerProgress =
    hasLoadedMetadata && startTime !== null && duration && part === "end" ? (startTime * 100) / duration : null;

  function handleTimeUpdate() {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const newTime = part === "start" ? currentTime : Math.max(currentTime, startTime || 0);
      setVideoProgress(newTime);
    }
  }

  const handleScrubberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const scrubberTime = parseFloat(e.target.value);
    const newTime = part === "start" ? scrubberTime : Math.max(scrubberTime, startTime || 0);
    setVideoProgress(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const label = e.currentTarget.value;
    setUnsavedVideosData((uSVsD) => uSVsD.with(id, { ...uSVsD[id], label }));
  }

  function handleLoadedMetadata() {
    setHasLoadedMetadata(true);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (part === "end" && startTime) {
        videoRef.current.currentTime = startTime;
        markerProgress = (startTime / duration) * 100;
      }
      const thisTime = unsavedVideosData[id].times[part];
      if (thisTime) {
        videoRef.current.currentTime = thisTime;
      }
    }
  }

  function getMediaTime(id: number) {
    if (videoRef.current) {
      videoRef.current.requestVideoFrameCallback((_, metadata) => {
        setUnsavedVideosData((uSVsD) =>
          uSVsD.with(id, {
            ...uSVsD[id],
            times: {
              ...uSVsD[id].times,
              [part]: metadata.mediaTime,
            },
          }),
        );
      });
      videoRef.current.requestVideoFrameCallback(() => getMediaTime(id));
    }
  }

  useEffect(() => {
    let request: number;
    const vElement = videoRef.current;
    if (vElement) {
      request = vElement.requestVideoFrameCallback(() => getMediaTime(id));
    }
    return () => {
      if (vElement) vElement.cancelVideoFrameCallback(request);
    };
  }, [id]);

  useEffect(() => {
    if (arePlaying[id]) videoRef.current?.play();
    else videoRef.current?.pause();
  }, [arePlaying, id]);

  useEffect(() => {
    if (isDragging) videoRef.current?.pause();
    if (!isDragging && wasPlaying) videoRef.current?.play();
  }, [isDragging, wasPlaying]);

  function scrub(numSeconds: number | "1frame") {
    if (!videoRef.current) return;
    if (typeof numSeconds === "number") {
      const newTime =
        part === "start"
          ? videoRef.current.currentTime + numSeconds
          : Math.max(videoRef.current.currentTime + numSeconds, startTime || 0);
      videoRef.current.currentTime = newTime;
    }
    // This allows for accurate *forward* frame stepping, even if the video has an inconsistent framerate.
    // There's no easy way to do this backwards, so the backwards 1/framerate scrub will miss frames occasionally.
    if (numSeconds === "1frame") {
      if (videoRef.current.ended) return;
      videoRef.current.play();
      videoRef.current.requestVideoFrameCallback(() => {
        videoRef.current?.pause();
      });
    }
  }

  const menuLiButtonClassName =
    "btn w-full btn-xs px-1 py-3 @min-sm:btn-md @min-sm:px-2 @min-md:btn-lg @min-md:px-3 btn-soft mt-5 mb-2 join-item border-3";
  
  const liClassName = "flex grow"

  return (
    <div className="flex max-w-xl grow basis-md flex-col items-center">
      <input
        type="text"
        className="input input-ghost bg-base-200 border-base-300 border-3 text-lg"
        placeholder="Label?"
        onChange={handleInputChange}
        defaultValue={unsavedVideosData[id].label || undefined}
      />
      <div className="skeleton indicator rounded-box bg-base-200 my-5 flex aspect-video w-full items-center justify-center">
        {isLoading && <div className="indicator-item indicator-center indicator-middle loading size-12" />}
        <video
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setArePlaying((aP) => aP.with(id, false))}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          ref={videoRef}
          src={url}
          className="border-base-300 rounded-box size-full border-3 object-contain"
        ></video>
      </div>
      <div className="relative flex w-[calc(100%-1rem)] items-center" style={{ "--marker-progress": markerProgress }}>
        <input
          type="range"
          className="range range-xs w-full"
          min={0}
          max={duration || 1}
          value={videoProgress}
          onChange={handleScrubberChange}
          step="any"
          onMouseDown={() => {
            setIsDragging(true);
            setWasPlaying(arePlaying[id]);
          }}
          onMouseUp={() => setIsDragging(false)}
        ></input>
        {markerProgress !== null && (
          <div className="bg-main-text mask mask-triangle-2 pointer-events-none absolute top-0 left-[calc(var(--marker-progress)*1%+(0.5-var(--marker-progress)/100)*1rem)] size-2.5 -translate-x-1/2 -translate-y-[calc(100%+0.3rem)]"></div>
        )}
      </div>
      <menu className="join @container flex w-[calc(100%-2rem)] justify-center gap-1">
        <li className={liClassName}>
          <button onClick={() => scrub(-1)} className={cn(menuLiButtonClassName, "btn-success border-success")}>
            -1s
          </button>
        </li>
        <li className={liClassName}>
          <button onClick={() => scrub(-0.1)} className={cn(menuLiButtonClassName, "btn-warning border-warning")}>
            -0.1s
          </button>
        </li>
        <li className={liClassName}>
          <button
            onClick={() => scrub(-1 / framerate)}
            className={cn(menuLiButtonClassName, "btn-primary border-primary")}
          >
            -1f
          </button>
        </li>
        <li className={liClassName}>
          <button
            onClick={() => setArePlaying((aP) => aP.with(id, !aP[id]))}
            className={cn(menuLiButtonClassName, "btn-error border-error")}
          >
            {arePlaying[id] ? (
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
        </li>
        <li className={liClassName}>
          <button onClick={() => scrub("1frame")} className={cn(menuLiButtonClassName, "btn-primary border-primary")}>
            +1f
          </button>
        </li>
        <li className={liClassName}>
          <button onClick={() => scrub(0.1)} className={cn(menuLiButtonClassName, "btn-warning border-warning")}>
            +0.1s
          </button>
        </li>
        <li className={liClassName}>
          <button onClick={() => scrub(1)} className={cn(menuLiButtonClassName, "btn-success border-success")}>
            +1s
          </button>
        </li>
      </menu>
    </div>
  );
}
