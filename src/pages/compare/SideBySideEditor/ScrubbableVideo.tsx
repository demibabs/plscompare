import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { cn } from "../../../utils/cn";
import type { FileData, Part, VideoData } from "./SideBySideEditor";

export function ScrubbableVideo({
  fileData,
  unsavedVideosData,
  part,
}: {
  fileData: FileData;
  unsavedVideosData: RefObject<VideoData[]>;
  part: Part;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(1);

  const { id, url, framerate } = fileData;

  const startTime = unsavedVideosData.current[id].times.start;

  function handleTimeUpdate() {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const newTime = part === "start" ? currentTime : Math.max(currentTime, startTime || 0)
      setVideoProgress(newTime);
    }
  }

  const handleScrubberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const scrubberTime = parseFloat(e.target.value);
    const newTime = part === "start" ? scrubberTime : Math.max(scrubberTime, startTime || 0)
    setVideoProgress(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    unsavedVideosData.current[id].label = e.currentTarget.value;
  }

  function getMediaTime(id: number) {
    if (videoRef.current) {
      videoRef.current.requestVideoFrameCallback((_, metadata) => {
        unsavedVideosData.current[id].times[part] = metadata.mediaTime;
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
  }, []);

  useEffect(() => {
    if (isPlaying) videoRef.current?.play();
    else videoRef.current?.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (isDragging) videoRef.current?.pause();
    if (!isDragging && wasPlaying) videoRef.current?.play();
  }, [isDragging, wasPlaying]);

  function scrub(numSeconds: number) {
    if (!videoRef.current) return;
    const newTime = part === "start" ? videoRef.current.currentTime + numSeconds : Math.max(videoRef.current.currentTime + numSeconds, startTime || 0)
    videoRef.current.currentTime = newTime
  }

  function handleLoadedMetadata() {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (part === "end" && startTime){
        videoRef.current.currentTime = startTime
      }
      const thisTime = unsavedVideosData.current[id].times[part];
      if (thisTime) {
        videoRef.current.currentTime = thisTime;
      }
    }
  }

  const menuLiButtonClassName = "btn btn-xl px-3 mt-5 mb-2 join-item border-3 border-base-300";

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        className="input border-3"
        placeholder="Label?"
        onChange={handleInputChange}
        defaultValue={unsavedVideosData.current[id].label || undefined}
      />
      <div className="skeleton indicator rounded-box bg-base-200 my-5 flex aspect-video w-xl items-center justify-center">
        {isLoading && <div className="indicator-item indicator-center indicator-middle loading size-12" />}
        <video
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          ref={videoRef}
          src={url}
          className="border-base-300 rounded-box size-full border-3 object-contain"
        ></video>
      </div>
      <input
        type="range"
        className="range range-xs w-lg"
        min={0}
        max={duration || 1}
        value={videoProgress}
        onChange={handleScrubberChange}
        step="any"
        onMouseDown={() => {
          setIsDragging(true);
          setWasPlaying(isPlaying);
        }}
        onMouseUp={() => setIsDragging(false)}
      ></input>
      <menu className="join gap-1">
        <li>
          <button onClick={() => scrub(-1)} className={cn(menuLiButtonClassName, "btn-info")}>
            -1s
          </button>
        </li>
        <li>
          <button onClick={() => scrub(-0.1)} className={cn(menuLiButtonClassName, "btn-secondary")}>
            -0.1s
          </button>
        </li>
        <li>
          <button onClick={() => scrub(-1 / framerate)} className={cn(menuLiButtonClassName, "btn-primary")}>
            -1f
          </button>
        </li>
        <li>
          <button onClick={() => setIsPlaying(!isPlaying)} className={cn(menuLiButtonClassName, "btn-accent")}>
            {isPlaying ? (
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
        <li>
          <button onClick={() => scrub(1 / framerate)} className={cn(menuLiButtonClassName, "btn-primary")}>
            +1f
          </button>
        </li>
        <li>
          <button onClick={() => scrub(0.1)} className={cn(menuLiButtonClassName, "btn-secondary")}>
            +0.1s
          </button>
        </li>
        <li>
          <button onClick={() => scrub(1)} className={cn(menuLiButtonClassName, "btn-info")}>
            +1s
          </button>
        </li>
      </menu>
    </div>
  );
}
