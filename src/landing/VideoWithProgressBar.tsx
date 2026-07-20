import { useRef, useState } from "react";

export function VideoWithProgressBar({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <figure className="bg-base-200 border-base-300 skeleton rounded-box flex aspect-video w-full items-center justify-center border-3">
        <video
          ref={videoRef}
          playsInline
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          className="rounded-box"
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
        ></video>
      </figure>
      <progress className="progress progress-primary w-[calc(100%-2rem)]" value={progress} max={duration}></progress>
    </div>
  );
}
