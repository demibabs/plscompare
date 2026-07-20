import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { cn } from "../../../utils/cn";
import type { FileData, Part, VideoData } from "./SideBySideEditor";

export function ScrubbableVideo({
  fileData,
  videosData,
  setVideosData,
  videosRef,
  arePlaying,
  setArePlaying,
  durations,
  setDurations,
  part,
}: {
  fileData: FileData;
  videosData: VideoData[];
  setVideosData: Dispatch<SetStateAction<VideoData[]>>;
  videosRef: RefObject<HTMLVideoElement[]>;
  arePlaying: boolean[];
  setArePlaying: Dispatch<SetStateAction<boolean[]>>;
  durations: number[];
  setDurations: Dispatch<SetStateAction<number[]>>;
  part: Part;
}) {
  const { id, url, framerate } = fileData;

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedMetadata, setHasLoadedMetadata] = useState(false);
  const wasPlaying = useRef(false);
  const scrubberRef = useRef<HTMLInputElement>(null);

  const startTime = videosData[id]?.times.start ?? null;
  const markerProgress =
    hasLoadedMetadata && startTime !== null && durations[id] && part === "end"
      ? (startTime * 100) / durations[id]
      : null;

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
    const currentTime = e.currentTarget.currentTime;
    if (part === "end" && startTime && currentTime < startTime) {
      e.currentTarget.currentTime = startTime;
    }
  }

  const handleScrubberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const scrubberTime = parseFloat(e.target.value);
    const newTime = part === "start" ? scrubberTime : Math.max(scrubberTime, startTime || 0);
    if (videosRef.current[id]) {
      videosRef.current[id].currentTime = newTime;
    }
    setVideosData((vsData) =>
      vsData.with(id, {
        ...vsData[id],
        times: {
          ...vsData[id].times,
          [part]: newTime,
        },
      }),
    );
  };

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const label = e.currentTarget.value;
    setVideosData((vsData) => vsData.with(id, { ...vsData[id], label }));
  }

  function handleLoadedMetadata() {
    setHasLoadedMetadata(true);
    if (videosRef.current[id]) {
      setDurations((durs) => durs.with(id, videosRef.current[id].duration));
      if (part === "end" && startTime !== null) {
        videosRef.current[id].currentTime = startTime;
      }
      const thisTime = videosData[id].times[part];
      if (thisTime !== null) {
        videosRef.current[id].currentTime = thisTime;
      }
    }
  }

  function getMediaTime(now: number, metadata: VideoFrameCallbackMetadata) {
    if (!isDragging) {
      setVideosData((vsData) =>
        vsData.with(id, {
          ...vsData[id],
          times: {
            ...vsData[id].times,
            [part]: metadata.mediaTime,
          },
        }),
      );
    }
     if (videosRef.current[id]) {
      videosRef.current[id].requestVideoFrameCallback(getMediaTime);
    }
  }

  useEffect(() => {
    let request: number;
    const vElement = videosRef.current[id];
    if (vElement) {
      request = vElement.requestVideoFrameCallback(getMediaTime);
    }
    return () => {
      if (vElement) vElement.cancelVideoFrameCallback(request);
    };
  }, [id, videosRef]);

  useEffect(() => {
    if (arePlaying[id]) videosRef.current[id]?.play();
    else videosRef.current[id]?.pause();
  }, [arePlaying, id, videosRef]);

  useEffect(() => {
    if (isDragging) {
      videosRef.current[id]?.pause();
    }
    if (!isDragging && wasPlaying.current) videosRef.current[id]?.play();
  }, [isDragging, id, videosRef]);

  function scrub(numSeconds: number) {
    // 1. Find duration of frame
    const frameDuration = 1 / framerate;
    // 2. Find exactly which frame we are currently on
    const currentFrame = Math.round(videosRef.current[id].currentTime / frameDuration);
    // 3. Find how many frames we want to move (works for 0.1s, 1s, and 1f)
    const frameOffset = Math.round(numSeconds / frameDuration);
    const targetFrame = currentFrame + frameOffset;
    // 4. Calculate new time, adding 0.4 to land near the middle of the frame
    // (if added 0.5, that would round up on some browsers, not wanted)
    const calculatedTime = (targetFrame + 0.4) * frameDuration;

    const newTime = part === "start" ? calculatedTime : Math.max(calculatedTime, startTime || 0);
    videosRef.current[id].currentTime = newTime;
  }

  const menuLiButtonClassName = cn(
    "btn w-full btn-xs px-1 py-3 @min-sm:btn-md @min-sm:px-2 @min-md:btn-lg @min-md:px-3 btn-soft mt-5 mb-2 join-item border-3",
    { "btn-disabled border-none": isLoading },
  );

  const liClassName = "flex grow";

  return (
    <div className="flex max-w-xl grow basis-md flex-col items-center">
      <input
        type="text"
        className="input input-ghost bg-base-200 border-base-300 border-3 text-lg"
        placeholder="Label?"
        onChange={handleInputChange}
        defaultValue={videosData[id].label || undefined}
      />
      <div className="skeleton indicator rounded-box bg-base-200 my-5 flex w-full items-center justify-center">
        {isLoading && <div className="indicator-item indicator-center indicator-middle loading size-12" />}
        <video
          onPause={() => setArePlaying((aP) => aP.with(id, false))}
          onPlay={() => setArePlaying((aP) => aP.with(id, true))}
          muted
          preload="auto"
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setArePlaying((aP) => aP.with(id, false))}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          ref={(e) => {
            if (e) videosRef.current[id] = e;
          }}
          src={url}
          className="border-base-300 rounded-box size-full border-3 object-contain md:aspect-video"
        ></video>
      </div>
      <div className="relative flex w-[calc(100%-1rem)] items-center" style={{ "--marker-progress": markerProgress }}>
        <input
          ref={scrubberRef}
          type="range"
          className="range range-xs w-full"
          min={0}
          max={durations[id] || 1}
          value={videosData[id].times[part] || videosData[id].times.start || 0}
          step={"any"}
          onChange={handleScrubberChange}
          disabled={isLoading}
          onMouseDown={() => {
            setIsDragging(true);
            wasPlaying.current = arePlaying[id];
          }}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => {
            setIsDragging(true);
            wasPlaying.current = arePlaying[id];
          }}
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
          <button
            onClick={() => scrub(1 / framerate)}
            className={cn(menuLiButtonClassName, "btn-primary border-primary")}
          >
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
