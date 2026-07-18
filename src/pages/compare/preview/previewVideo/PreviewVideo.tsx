import { useEffect, useRef, useState } from "react";
import type { FileData, VideoData } from "../../sideBySideEditor/SideBySideEditor";
import { cn } from "../../../../utils/cn";
import { renderFrame, type Dimensions, type Layout } from "./renderFrame";
import { formatSecondsToSSMS } from "../../../../utils/formatMsToSSMS";
import { useVideoExport } from "./useVideoExport";
import { hasTimes } from "../../../../utils/hasTimes";
import { clear } from "idb-keyval";
import { useNavigate } from "react-router-dom";

export function PreviewVideo({ filesData, videosData }: { filesData: FileData[]; videosData: VideoData[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videosRef = useRef<HTMLVideoElement[]>(Array(filesData.length).fill(null));
  const [isInFreezeFrame, setIsInFreezeFrame] = useState(false);
  const timerRef = useRef<number>(undefined);
  const freezeFrameTime = 1;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const request = useRef<number>(0);
  const requests = useRef<number[]>(Array(videosData.length).fill(undefined));
  const mediaTimes = useRef<number[]>(videosData.map((vData) => vData.times.start as number));
  const timerStartTimes = useRef<number[]>(Array(videosData.length).fill(-1));
  const longestVideoIndex = useRef(-1);
  const [layout] = useState<Layout>("default");
  const { startExport, progress, error, cancelExport } = useVideoExport();
  const [exportModal, setExportModal] = useState(false);
  const exportModalRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const [unsavedFileName, setUnsavedFileName] = useState("");

  console.log(error, progress);

  let canvasDimensions = { width: 1920, height: 1080 };

  function watchVideo(vElement: HTMLVideoElement, index: number) {
    vElement.requestVideoFrameCallback((_, metadata) => {
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

  function renderVideo() {
    if (videosRef.current && canvasRef.current && videosData.every((vData) => hasTimes(vData))) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const sourcesDimensions: Dimensions[] = videosRef.current.map((vElement) => ({
          width: vElement.videoWidth,
          height: vElement.videoHeight,
        }));
        const labelsText = videosData.map((vData) => vData.label);
        const timersText = timerStartTimes.current.map((tSTime, index) => {
          if (tSTime === -1 || index === longestVideoIndex.current) return "";
          const timerTime =
            mediaTimes.current[longestVideoIndex.current] -
            videosData[longestVideoIndex.current].times.start -
            (videosData[index].times.end - videosData[index].times.start);
          return formatSecondsToSSMS(timerTime);
        });
        renderFrame(ctx, canvasDimensions, layout, videosRef.current, sourcesDimensions, labelsText, timersText);
      }
    }
    requestAnimationFrame(renderVideo);
  }

  function handleExport() {
    if (videosData.every((vData) => hasTimes(vData))) {
      const videos = videosData.map((vData, index) => ({
        url: filesData[index].url,
        times: vData.times,
        label: vData.label,
      }));
      const fileName = unsavedFileName || "plscompare";
      startExport({ videos, canvasDimensions, fileName, freezeFrameTime, layout });
    }
    if (exportModalRef.current) {
      exportModalRef.current?.showModal();
      setExportModal(true);
    }
  }

  useEffect(() => {
    if (exportModalRef.current) {
      if (exportModal) {
        exportModalRef.current.showModal();
      } else {
        exportModalRef.current.close();
        cancelExport();
      }
    }
  }, [exportModal]);

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
    request.current = requestAnimationFrame(renderVideo);
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
      <div className="flex grow flex-col items-center px-10 py-5">
        <label className="input input-ghost bg-base-200 border-base-300 mb-5 border-3 text-lg">
          <input
            placeholder="File name?"
            value={unsavedFileName}
            onChange={(e) => setUnsavedFileName(e.currentTarget.value)}
          ></input>
          <span className="label bg-base-100 h-full rounded-r-field">.mp4</span>
        </label>
        <canvas
          ref={canvasRef}
          className="skeleton border-base-300 rounded-box aspect-video w-full max-w-2xl border-3"
          width={canvasDimensions.width}
          height={canvasDimensions.height}
        ></canvas>{" "}
        {[...Array(videosData.length)].map((_, index) => (
          <video
            className="hidden"
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
        <div className="flex flex-col items-center justify-center my-2 gap-2">
          <button
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current);

              if (isPlaying) setIsPlaying(false);
              else {
                if (videosRef.current[0].currentTime <= videosData[0].times.start + 0.02) {
                  playFreezeFrame();
                } else if (
                  videosRef.current.every((_, index) => {
                    return mediaTimes.current[index] >= videosData[index].times.end;
                  })
                ) {
                  videosRef.current.forEach(
                    (vElement, index) => (vElement.currentTime = videosData[index].times.start),
                  );
                  timerStartTimes.current.fill(-1);
                  playFreezeFrame();
                } else setIsPlaying(true);
              }
            }}
            className={cn("btn btn-lg border-base-300 btn-error border-3 px-3", {
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
          <div className="card-actions items-center justify-center">
            <button className="btn btn-primary border-base-300 btn-lg border-3">Options</button>
            <button className="btn btn-lg btn-warning border-base-300 border-3" onClick={handleExport}>
              Export
            </button>
            <dialog
              ref={exportModalRef}
              className="modal"
              onClose={() => {
                setExportModal(false);
              }}
            >
              <div className="modal-box">
                <h1 className="pb-3 text-3xl">
                  {progress === 100 ? (
                    "Video exported!"
                  ) : (
                    <span>
                      Exporting video... <span className="ml-1 text-2xl">({Math.round(progress)}%)</span>
                    </span>
                  )}
                </h1>
                <progress className="progress" value={progress} max={100}></progress>
                <div className="modal-action">
                  <form method="dialog" className="flex gap-3">
                    <button className="btn btn-error btn-soft btn-lg" value="cancel">
                      {progress === 100 ? "Close" : "Cancel"}
                    </button>
                    <button
                      className={cn("btn btn-lg btn-soft btn-success", { "btn-disabled": progress !== 100 })}
                      value="cancel"
                      onClick={async () => {
                        await clear();
                        navigate("/");
                      }}
                    >
                      Home
                    </button>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button value="cancel"></button>
              </form>
            </dialog>
          </div>
        </div>
      </div>
    )
  );
}
