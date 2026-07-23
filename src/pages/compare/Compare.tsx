import { get, set } from "idb-keyval";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { FileData, VideoData } from "./sideBySideEditor/SideBySideEditor";
import { SomethingWentWrong } from "./SomethingWentWrong";
import type { Options } from "./preview/previewVideo/PreviewVideo";
import { type FrameData } from "../../utils/getFrameData";

export function Compare() {
  const [isLoading, setIsLoading] = useState(true);
  const [filesData, setFilesData] = useState<FileData[]>([]);
  const [videosData, setVideosData] = useState<VideoData[]>([]);
  const [fileName, setFileName] = useState("");
  const defaultOptions: Options = { layout: "default", freezeFrameTime: 2 };
  const [options, setOptions] = useState<Options>(defaultOptions);
  const [hasInteracted, setHasInteracted] = useState(() => {
    if (window?.navigator?.userActivation) {
      return window.navigator.userActivation.hasBeenActive;
    }
    return false;
  });

  useEffect(() => {
    let activeUrls: string[] = [];

    async function loadFromIDB() {
      setIsLoading(true);
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      activeUrls = [];

      await get("videos-data").then((vData) => {
        if (vData) setVideosData(vData);
      });
      // Fetch the files from IndexedDB
      await get("user-files").then(async (storedFiles: {file: File, frameData: FrameData}[]) => {
        if (storedFiles) {
          storedFiles.forEach((f) => {
            activeUrls.push(URL.createObjectURL(f.file));
          });
          setFilesData(
            await Promise.all(
              storedFiles.map(async (f, index) => {
                return {
                  id: index,
                  url: activeUrls[index],
                  framerate: f.frameData.framerate,
                  allFrameTimes: f.frameData.allFrameTimes
                };
              }),
            ),
          );
        }
      });
      await get("file-name").then((fName) => {
        if (fName) setFileName(fName);
      });
      await get("options").then((ops) => {
        if (ops) setOptions(ops);
      });
      setIsLoading(false);
    }
    loadFromIDB();
    window.addEventListener("files-ready-for-compare", async () => {
      await loadFromIDB();
      setHasInteracted(true);
    });
    return () => {
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      window.removeEventListener("files-ready-for-compare", loadFromIDB);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      set("videos-data", videosData);
    }
  }, [videosData, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      set("file-name", fileName);
    }
  }, [fileName, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      set("options", options);
    }
  }, [options, isLoading]);

  if (!isLoading) {
    if (!filesData || filesData.length < 2) {
      return <SomethingWentWrong data="files"></SomethingWentWrong>;
    }
    if (!hasInteracted) {
      return <SomethingWentWrong data="noInteraction" setHasInteracted={setHasInteracted}></SomethingWentWrong>;
    }
  }

  return isLoading ? (
    <div className="h-dvh w-full opacity-0"></div>
  ) : (
    <Outlet context={{ filesData, videosData, setVideosData, fileName, setFileName, options, setOptions }} />
  );
}
