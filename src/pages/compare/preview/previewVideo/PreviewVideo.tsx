import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { FileData, VideoData } from "../../sideBySideEditor/SideBySideEditor";
import { cn } from "../../../../utils/cn";
import { renderFrame, type Dimensions, type Layout } from "./renderFrame";
import { formatSecondsToSSMS } from "../../../../utils/formatMsToSSMS";
import { useVideoExport } from "./useVideoExport";
import { hasTimes } from "../../../../utils/hasTimes";
import { clear, set } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getCanvasDimensions } from "../../../../utils/getCanvasDimensions";

export type Options = {
  layout: Layout;
  freezeFrameTime: number;
};

export function PreviewVideo() {
  const { filesData, videosData, fileName, setFileName, options, setOptions } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    fileName: string;
    setFileName: Dispatch<SetStateAction<string>>;
    options: Options;
    setOptions: Dispatch<SetStateAction<Options>>;
  }>();
  const videosRef = useRef<HTMLVideoElement[]>(Array(filesData.length).fill(null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const freezeFrameTime = options.freezeFrameTime;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const request = useRef<number>(0);
  const requests = useRef<number[]>(Array(videosData.length).fill(undefined));
  const mediaTimes = useRef<number[]>(videosData.map((vData) => vData.times.start as number));
  const timerStartTimes = useRef<number[]>(Array(videosData.length).fill(-1));
  const longestVideoIndex = useRef(-1);
  const { startExport, progress, error, cancelExport } = useVideoExport();
  const [exportModal, setExportModal] = useState(false);
  const exportModalRef = useRef<HTMLDialogElement>(null);
  const [optionsModal, setOptionsModal] = useState(false);
  const optionsModalRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const optionsForLoop = useRef<Options>(options);

  const canvasDimensions = getCanvasDimensions(options.layout, filesData.length);

  useEffect(() => {
    optionsForLoop.current = options;
  }, [options]);

  function watchVideo(vElement: HTMLVideoElement, index: number) {
    vElement.requestVideoFrameCallback((_, metadata) => {
      mediaTimes.current[index] = metadata.mediaTime;
      if (metadata.mediaTime >= (videosData[index].times.end as number) - 1 / filesData[index].framerate) {
        vElement.pause();
        vElement.currentTime = (videosData[index].times.end as number) + 0.005;
        mediaTimes.current[index] = videosData[index].times.end as number;
        timerStartTimes.current[index] = videosData[index].times.end as number;

        if (videosRef.current.every((vElement) => vElement.paused)) {
          if (isPlaying) setIsPlaying(false);
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
        renderFrame(ctx, optionsForLoop.current.layout, videosRef.current, sourcesDimensions, labelsText, timersText);
      }
    }
    requestAnimationFrame(renderVideo);
  }

  function handleExport() {
    setIsPlaying(false);
    if (videosData.every((vData) => hasTimes(vData))) {
      const videos = videosData.map((vData, index) => ({
        url: filesData[index].url,
        times: vData.times,
        label: vData.label,
        framerate: filesData[index].framerate,
      }));
      startExport({
        videos,
        fileName: fileName || "plscompare",
        freezeFrameTime,
        layout: optionsForLoop.current.layout,
      });
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
    if (optionsModalRef.current) {
      if (optionsModal) {
        optionsModalRef.current.showModal();
      } else {
        optionsModalRef.current.close();
      }
    }
  }, [optionsModal]);

  useEffect(() => {
    const videos = videosRef.current;
    if (isPlaying) {
      videos.forEach((vElement, index) => {
        requests.current[index] = vElement.requestVideoFrameCallback(() => {
          watchVideo(vElement, index);
        });
      });
      if (videosRef.current.every((vElement) => vElement.ended)) {
        videosRef.current.forEach((vElement) => void vElement.play());
      } else {
        videosRef.current.forEach((vElement, index) => {
          if (
            hasTimes(videosData[index]) &&
            vElement.currentTime < videosData[index].times.end - 1 / filesData[index].framerate
          )
            void vElement.play();
        });
      }
    } else {
      videosRef.current.forEach((vElement) => {
        vElement.pause();
      });
      videos.forEach((vElement, index) => {
        vElement.cancelVideoFrameCallback(requests.current[index]);
      });
    }
    return () => {
      videos.forEach((vElement, index) => {
        vElement.cancelVideoFrameCallback(requests.current[index]);
      });
    };
  }, [isPlaying]);

  useEffect(() => {
    request.current = requestAnimationFrame(renderVideo);
    return () => {
      cancelAnimationFrame(request.current);
    };
  }, []);

  return (
    videosData.every((vData) => hasTimes(vData)) && (
      <div className="flex grow flex-col items-center px-10 py-5">
        <label className="input input-ghost bg-base-200 border-base-300 mb-5 border-3 text-lg">
          <input
            placeholder="File name?"
            value={fileName}
            onChange={(e) => {
              setFileName(e.currentTarget.value);
            }}
          ></input>
          <span className="label bg-base-100 rounded-r-field h-full">.mp4</span>
        </label>
        <canvas
          ref={canvasRef}
          className="skeleton border-base-300 rounded-box h-auto max-h-90 max-w-full border-3"
          width={canvasDimensions.width}
          height={canvasDimensions.height}
        ></canvas>{" "}
        {[...Array(videosData.length)].map((_, index) => (
          <video
            playsInline
            muted
            className="hidden"
            preload="auto"
            key={filesData[index].id}
            src={filesData[index].url}
            ref={(e) => {
              if (e) videosRef.current[index] = e;
            }}
            onLoadedMetadata={() => (videosRef.current[index].currentTime = videosData[index].times.start + 0.005)}
            onCanPlayThrough={() => {
              if (videosRef.current.every((vElement) => vElement.readyState >= 2)) {
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
                videosRef.current[index].currentTime = videosData[index].times.start + 0.005;
              }
            }}
          />
        ))}
        <div className="my-2 flex flex-col items-center justify-center gap-2">
          <button
            onClick={() => {
              if (isPlaying) setIsPlaying(false);
              else {
                if (
                  videosRef.current.every((_, index) => {
                    return (
                      mediaTimes.current[index] >= videosData[index].times.end - 1 / (2 * filesData[index].framerate)
                    );
                  })
                ) {
                  videosRef.current.forEach(
                    (vElement, index) => (vElement.currentTime = videosData[index].times.start + 0.005),
                  );
                  timerStartTimes.current.fill(-1);
                  setIsPlaying(true);
                } else setIsPlaying(true);
              }
            }}
            className={cn("btn btn-lg border-base-300 btn-error border-3 px-3", {
              "btn-disabled": false, //!canPlay,
            })}
          >
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
          <div className="card-actions items-center justify-center">
            <button
              className="btn btn-primary border-base-300 btn-lg border-3"
              onClick={() => {
                setOptionsModal(true);
                setIsPlaying(false);
              }}
            >
              Options
            </button>
            <dialog
              ref={optionsModalRef}
              className="modal"
              onClose={() => {
                setOptionsModal(false);
              }}
            >
              <div className="modal-box">
                <h1 className="pb-3 text-3xl">Options</h1>
                <ul className="w-full">
                  <li className="bg-base-200 rounded-box bgp-formalInvitation-base-100/10 mt-3 flex w-full items-center justify-between gap-3 p-5 text-lg">
                    <p className="pr-5">Freeze-frame duration (seconds)</p>
                    <input
                      maxLength={2}
                      className="input w-15 border-3 text-end text-lg"
                      value={options.freezeFrameTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allows only integers.
                        if (val === "" || /^\d+$/.test(val)) {
                          setOptions({ ...options, freezeFrameTime: Number(val) || 0 });
                        }
                      }}
                    ></input>
                  </li>
                  <li className="bg-base-200 rounded-box bgp-formalInvitation-base-100/10 mt-3 flex w-full items-center justify-between gap-3 p-5 text-lg">
                    <p>Layout</p>
                    <div className="bg-base-100 rounded-field border-base-content/20 h-full border-3 p-2 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <p>Default</p>
                        <input
                          type="radio"
                          className="radio"
                          name="layout-radio"
                          checked={options.layout === "default"}
                          onChange={() => {
                            setOptions({ ...options, layout: "default" });
                          }}
                        ></input>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <p>Vertical</p>
                        <input
                          type="radio"
                          className="radio"
                          name="layout-radio"
                          checked={options.layout === "vertical"}
                          onChange={() => {
                            setOptions({ ...options, layout: "vertical" });
                          }}
                        ></input>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <p>Horizontal</p>
                        <input
                          type="radio"
                          className="radio"
                          name="layout-radio"
                          checked={options.layout === "horizontal"}
                          onChange={() => {
                            setOptions({ ...options, layout: "horizontal" });
                          }}
                        ></input>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <p>Grid</p>
                        <input
                          type="radio"
                          className="radio"
                          name="layout-radio"
                          checked={options.layout === "grid"}
                          onChange={() => {
                            setOptions({ ...options, layout: "grid" });
                          }}
                        ></input>
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn btn-lg btn-primary">Done</button>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button></button>
              </form>
            </dialog>
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
                      {error ? (
                        <>Something went wrong...</>
                      ) : (
                        <>
                          Exporting video... <span className="ml-1 text-2xl">({Math.round(progress)}%)</span>
                        </>
                      )}
                    </span>
                  )}
                </h1>
                {error ? (
                  <p>Error message: {error}</p>
                ) : (
                  <progress className="progress" value={progress} max={100}></progress>
                )}
                <div className="modal-action">
                  <form method="dialog" className="flex gap-3">
                    <button className="btn btn-error btn-soft btn-lg" value="cancel">
                      {progress === 100 || error ? "Close" : "Cancel"}
                    </button>
                    <button
                      className={cn("btn btn-lg btn-soft btn-success", { "btn-disabled": progress !== 100 })}
                      onClick={() => {
                        void clear().then(() => navigate("/"))
                      }}
                    >
                      Home
                    </button>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button></button>
              </form>
            </dialog>
          </div>
        </div>
      </div>
    )
  );
}
