import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { cn } from "../utils/cn";
import { clear, get, update } from "idb-keyval";
import { useNavigate } from "react-router-dom";
import type { VideoData } from "../pages/compare/sideBySideEditor/SideBySideEditor";
import { getFrameData, type FrameData } from "../utils/getFrameData";
import posthog from "../posthog";
import { checkIsSupportedVideo } from "../utils/checkIsSupportedVideo";

export function FileUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [userFiles, setUserFiles] = useState<{ file: File; frameData: FrameData }[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Makes sure button is initially synced with files user has submitted
  useEffect(() => {
    async function getUserFiles() {
      await get("user-files").then((uFiles: { file: File; frameData: FrameData }[] | undefined) => {
        if (uFiles) {
          setUserFiles(uFiles);
          if (uFiles.length === 1) {
            setStatusMessage("Submit at least 1 more file to proceed.");
          }
        }
      });
    }
    void getUserFiles();
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
    if (!event.target.files) {
      return;
    }
    const newFiles = Array.from(event.target.files);
    if (newFiles.some((nFile) => nFile.size === 0)) {
      setStatusMessage("All files must be larger than 0 bytes.");
      posthog.capture("file_upload_error", { reason: "zero_byte_file", file_count: newFiles.length });
      return;
    }
    for (const file of newFiles) {
      let isSupported;
      try {
        isSupported = await checkIsSupportedVideo(file);
      } catch (error) {
        setStatusMessage(`${error}`);
        posthog.capture("file_upload_error", { reason: `${error}`, file_count: newFiles.length });
        return;
      }
      if (!isSupported) {
        setStatusMessage("That file type is not supported.");
        posthog.capture("file_upload_error", { reason: "unsupported_file_type", file_count: newFiles.length });
        return;
      }
    }

    let framesData: FrameData[];

    try {
      framesData = await Promise.all(newFiles.map(getFrameData));
    } catch (error) {
      setStatusMessage(`${error}`);
      posthog.capture("file_upload_error", { reason: `${error}`, file_count: newFiles.length });
      return;
    }

    // Put data into { file, frameData } form
    const returnedData = newFiles.map((nF, index) => ({ file: nF, frameData: framesData[index] }));
    await update("user-files", (uFiles: { file: File; frameData: FrameData }[] | undefined) => {
      if (uFiles) {
        return uFiles.concat(returnedData);
      } else return returnedData;
    });
    if (userFiles.length + newFiles.length === 1) setStatusMessage("Submit at least 1 more file to proceed.");
    else setStatusMessage("");
    posthog.capture("files_uploaded", {
      new_file_count: newFiles.length,
      total_file_count: userFiles.length + newFiles.length,
    });
    setUserFiles((uFiles) => uFiles.concat(returnedData));
    const newVideosData: VideoData[] = newFiles.map(() => {
      return {
        label: null,
        times: {
          start: null,
          end: null,
        },
      };
    });
    await update("videos-data", (vsData: VideoData[] | undefined) => {
      if (vsData) return vsData.concat(newVideosData);
      else return newVideosData;
    });
  }

  return (
    // Status message wrapper
    <div
      className={cn("indicator flex justify-center gap-3", {
        "tooltip tooltip-bottom tooltip-open tooltip-neutral before:text-lg": statusMessage,
      })}
      data-tip={statusMessage}
    >
      {userFiles.length > 0 && (
        <>
          {/* X button */}
          <span className="indicator-item tooltip" data-tip={userFiles.map((uFile) => uFile.name).join(", ")}>
            <span className="badge badge-error border-base-100 border-3">
              <b>{userFiles.length}</b>
            </span>
          </span>
          {/* File count button */}
          <span className="indicator-item indicator-top indicator-start">
            <span
              className="badge badge-error border-base-100 border-3"
              onClick={() => {
                posthog.capture("files_cleared", { file_count: userFiles.length });
                void clear().then(() => {
                  setUserFiles([]);
                  setStatusMessage("");
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </span>
          </span>
        </>
      )}
      {isLoading && (
        <span className="indicator-item indicator-center indicator-middle loading loading-spinner text-main-text loading-xl"></span>
      )}
      {/* The actual upload button */}
      <button
        onClick={() => {
          inputRef.current?.click();
          setStatusMessage("");
        }}
        className="btn btn-lg md:btn-xl btn-warning"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        Upload clips
      </button>
      {/* Invisible input that triggers the file popup */}
      <input
        accept="video/mp4, video/quicktime, video/webm, video/x-matroska, video/mp2t, video/ogg, .mp4, .m4v, .mov, .webm, .mkv, .ts, .mts, .ogv"
        type="file"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={(e) => {
          setIsLoading(true);
          void handleFileChange(e).then(() => {
            setIsLoading(false);
          });
        }}
      ></input>
      {/* Go button */}
      {userFiles.length >= 2 && (
        <button
          className="btn btn-lg md:btn-xl btn-warning btn-soft"
          onClick={() => {
            posthog.capture("comparison_started", { file_count: userFiles.length });
            window.dispatchEvent(new Event("files-ready-for-compare"));
            void navigate("/compare/start-frame");
          }}
        >
          Go
        </button>
      )}
    </div>
  );
}
