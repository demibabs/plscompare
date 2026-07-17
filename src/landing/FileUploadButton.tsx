import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { get, update } from "idb-keyval";
import { useNavigate } from "react-router-dom";
import type { VideoData } from "../pages/compare/sideBySideEditor/SideBySideEditor";

export function FileUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function getUserFiles() {
      await get("user-files").then((uFiles) => {
        if (uFiles) {
          setUserFiles(uFiles);
          if (uFiles.length === 1){
            setStatusMessage("Submit at least 1 more file to proceed.")
          }
        }
      });
    }
    getUserFiles();
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
    if (!event.target.files) {
      return;
    }
    const newFiles = Array.from(event.target.files);
    if (newFiles.some((nFile) => nFile.size === 0)) {
      setStatusMessage("Something went wrong. Try again.");
      return;
    }
    await update("user-files", (uFiles: File[] | undefined) => {
      if (uFiles) {
        return uFiles.concat(newFiles);
      } else return newFiles;
    });
    if (userFiles.length + newFiles.length === 1) setStatusMessage("Submit at least 1 more file to proceed.");
    else setStatusMessage("");
    setUserFiles((uFiles) => uFiles.concat(newFiles));
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
    <div
      className={cn(
        "relative",
        { "tooltip tooltip-bottom tooltip-open tooltip-neutral before:text-lg": statusMessage },
        { indicator: userFiles.length > 0 },
      )}
      data-tip={statusMessage}
    >
      {userFiles.length > 0 && (
        <span className="indicator-item tooltip" data-tip={userFiles.map((uFile) => uFile.name).join(", ")}>
          <span className="badge badge-error border-3 border-base-100"><b>{userFiles.length}</b></span>
        </span>
      )}
      <button onClick={() => inputRef.current?.click()} className="btn btn-xl btn-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
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
      <input accept="video/quicktime, video/mp4, .mp4, .mov" type="file" multiple ref={inputRef} className="hidden" onChange={handleFileChange}></input>
      {userFiles.length >= 2 && (
        <button
          className="btn btn-xl btn-warning btn-soft absolute top-0 right-0 translate-x-[calc(100%+1.5rem)]"
          onClick={() => {
            window.dispatchEvent(new Event("files-ready-for-compare"));
            navigate("/compare/start-frame")
          }
        }
        >
          Go
        </button>
      )}
    </div>
  );
}
