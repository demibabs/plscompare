import { useEffect, useRef } from "react";

export function VideoWithProgressBar({ ...props }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLProgressElement>(null);
  const requestRef = useRef<number>(undefined);

  function updateProgressBar(_: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) {
    if (videoRef.current && progressBarRef.current) {
      progressBarRef.current.value = metadata.mediaTime / videoRef.current.duration;
      videoRef.current.requestVideoFrameCallback(updateProgressBar);
    }
  }

  // Progress bar updating loop
  useEffect(() => {
    const vRefCurrent = videoRef.current;
    if (vRefCurrent) {
      requestRef.current = vRefCurrent.requestVideoFrameCallback(updateProgressBar);
    }
    return () => {
      if (requestRef.current !== undefined) {
        vRefCurrent?.cancelVideoFrameCallback(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Video */}
      <figure className="bg-base-200 border-base-300 skeleton rounded-box overflow-hidden flex aspect-video w-full items-center justify-center border-3">
        <video
          className="size-full object-cover"
          ref={videoRef}
          playsInline
          autoPlay
          loop
          muted
          {...props}
        ></video>
      </figure>
      {/* Progress bar */}
      <progress ref={progressBarRef} className="progress progress-primary w-[calc(100%-2rem)]"></progress>
    </div>
  );
}
