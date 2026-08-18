import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { FileData, VideoData } from "../../sideBySideEditor/SideBySideEditor";
import { cn } from "../../../../utils/cn";
import { renderFrame, type Dimensions, type Layout } from "@plscompare/shared/renderFrame";
import { formatSecondsToSSMS } from "@plscompare/shared/formatSecondsToSSMS";
import { useVideoExport } from "./useVideoExport";
import { hasTimes } from "../../../../utils/hasTimes";
import { clear, get } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getCanvasDimensions } from "@plscompare/shared/getCanvasDimensions";
import posthog from "../../../../posthog";
import { useLatest } from "../../../../utils/useLatest";
import type { FrameData } from "../../../../utils/getFrameData";

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
  // Idk what even happened here ngl
  const videosRef = useRef<HTMLVideoElement[]>(Array(filesData.length).fill(null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const freezeFrameTime = options.freezeFrameTime;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const request = useRef<number>(0);
  const requests = useRef<number[]>(Array(videosData.length).fill(undefined));
  const mediaTimes = useRef<number[]>(videosData.map((vData) => vData.times.start ?? 0));
  const timerStartTimes = useRef<number[]>(Array(videosData.length).fill(-1));
  const longestVideoIndex = useRef(-1);
  const { startExport, progress, error, cancelExport, phase } = useVideoExport();
  const [exportModal, setExportModal] = useState(false);
  const exportModalRef = useRef<HTMLDialogElement>(null);
  const [optionsModal, setOptionsModal] = useState(false);
  const optionsModalRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const optionsLatest = useLatest<Options>(options);

  const canvasDimensions = getCanvasDimensions(options.layout, filesData.length);

  // Video callback loop (each video has its own)
  function watchVideo(vElement: HTMLVideoElement, index: number) {
    vElement.requestVideoFrameCallback((_, metadata) => {
      mediaTimes.current[index] = metadata.mediaTime;
      if (videosData[index].times.end) {
        // If video is past its end time, pause it and then clamp time to end time
        if (metadata.mediaTime >= videosData[index].times.end - 1 / filesData[index].framerate) {
          vElement.pause();
          vElement.currentTime = videosData[index].times.end + 0.005;
          mediaTimes.current[index] = videosData[index].times.end;
          timerStartTimes.current[index] = videosData[index].times.end;
        }
        if (videosRef.current.every((vElement) => vElement.paused)) {
          if (isPlaying) setIsPlaying(false);
          // End loops if all vids have stopped
          return;
        }
      }
      watchVideo(vElement, index);
    });
  }

  // Loop for rendering composited preview video
  function renderVideo() {
    if (canvasRef.current && videosData.every((vData) => hasTimes(vData))) {
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
        renderFrame(ctx, optionsLatest.current.layout, videosRef.current, sourcesDimensions, labelsText, timersText);
      }
    }
    requestAnimationFrame(renderVideo);
  }

  async function handleExport() {
    setIsPlaying(false);
    if (videosData.every((vData) => hasTimes(vData))) {
      const fs: { file: File; frameData: FrameData }[] = (await get("user-files")) ?? [];
      const files = fs.map((f) => f.file);
      const videos = videosData.map((vData, index) => ({
        times: vData.times,
        label: vData.label,
        framerate: filesData[index].framerate,
      }));
      posthog.capture("export_started", {
        file_count: filesData.length,
        layout: optionsLatest.current.layout,
        freeze_frame_time: freezeFrameTime,
      });
      void startExport(files, {
        videos,
        fileName: fileName || "plscompare",
        freezeFrameTime,
        layout: optionsLatest.current.layout,
      });
    }
    if (exportModalRef.current) {
      exportModalRef.current.showModal();
      setExportModal(true);
    }
  }

  // Synchronize modal states (will prob remove these states, they don't do anything)
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
    // Handle pausing and resuming watchVideo loops
    const videos = videosRef.current;
    if (isPlaying) {
      videos.forEach((vElement, index) => {
        requests.current[index] = vElement.requestVideoFrameCallback(() => {
          watchVideo(vElement, index);
        });
      });
      // Handle synchronizing isPlaying with actual video playback
      // Only play videos that havent reached their end time (unless all of them have reached their end time)
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

  // Handle animation loop that draws onto canvas
  useEffect(() => {
    request.current = requestAnimationFrame(renderVideo);
    return () => {
      cancelAnimationFrame(request.current);
    };
  }, []);

  return (
    videosData.every((vData) => hasTimes(vData)) && (
      <div className="flex grow flex-col items-center px-10 py-5">
        {/* File name input */}
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
        {/* Preview canvas */}
        <canvas
          ref={canvasRef}
          className="skeleton border-base-300 rounded-box h-auto max-h-90 max-w-full border-3"
          width={canvasDimensions.width}
          height={canvasDimensions.height}
        ></canvas>{" "}
        {/* Hidden videos that get compoisited onto canvas */}
        {[...(Array(videosData.length) as undefined[])].map((_, index) => (
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
          {/* First button row */}
          <div className="card-actions items-center justify-center">
            <button
              onClick={() => {
                videosRef.current.forEach((vElement, index) => {
                  vElement.currentTime = videosData[index].times.start + 0.005;
                  mediaTimes.current[index] = videosData[index].times.start;
                  timerStartTimes.current[index] = -1;
                  if (isPlaying) void vElement.play()
                });
              }}
              className="btn btn-lg border-base-300 btn-info border-3 px-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="size-6 rotate-180"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                />
              </svg>
            </button>
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
            <button
              onClick={() => {
                if (isPlaying) setIsPlaying(false);
                videosRef.current.forEach((vElement, index) => {
                  vElement.currentTime = videosData[index].times.end + 0.005;
                  mediaTimes.current[index] = videosData[index].times.end;
                  timerStartTimes.current[index] = videosData[index].times.end;
                });
              }}
              className="btn btn-lg border-base-300 btn-success border-3 px-3"
            >
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
                  d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                />
              </svg>
            </button>
          </div>
          {/* Second button row */}
          <div className="card-actions items-center justify-center">
            {/* Options button */}
            <button
              className="btn btn-primary border-base-300 btn-lg border-3"
              onClick={() => {
                setOptionsModal(true);
                setIsPlaying(false);
              }}
            >
              Options
            </button>
            {/* Options modal */}
            <dialog
              ref={optionsModalRef}
              className="modal"
              onClose={() => {
                setOptionsModal(false);
              }}
            >
              <div className="modal-box border-base-300 border-3">
                <h1 className="pb-3 text-3xl">
                  <b>Options</b>
                </h1>
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
                            posthog.capture("layout_changed", { layout: "default" });
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
                            posthog.capture("layout_changed", { layout: "vertical" });
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
                            posthog.capture("layout_changed", { layout: "horizontal" });
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
                            posthog.capture("layout_changed", { layout: "grid" });
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
            {/* Export button */}
            <button className="btn btn-lg btn-warning border-base-300 border-3" onClick={() => void handleExport()}>
              Export
            </button>
            {/* Export modal */}
            <dialog
              ref={exportModalRef}
              className="modal"
              onClose={() => {
                setExportModal(false);
              }}
            >
              <div className="modal-box border-base-300 border-3">
                <h1 className="pb-3 text-3xl">
                  <b>
                    {progress === 100 && phase === "Rendering" ? (
                      "Video exported!"
                    ) : (
                      <span>
                        {error ? (
                          <>Something went wrong...</>
                        ) : (
                          <>
                            {phase}... <span className="ml-1 text-2xl">({Math.round(progress)}%)</span>
                          </>
                        )}
                      </span>
                    )}
                  </b>
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
                      className={cn("btn btn-lg btn-soft btn-success", {
                        "btn-disabled": progress !== 100 || phase === "Uploading",
                      })}
                      onClick={() => {
                        void clear().then(() => navigate("/"));
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
