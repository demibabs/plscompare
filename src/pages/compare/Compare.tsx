import { get } from "idb-keyval";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { FileData, VideoData } from "./sideBySideEditor/SideBySideEditor";
import { getVideoFramerate } from "../../utils/getVideoFramerate";
import { SomethingWentWrong } from "./SomethingWentWrong";

export function Compare() {
  const [isLoading, setIsLoading] = useState(true);
  const [filesData, setFilesData] = useState<FileData[]>([]);
  const [videosData, setVideosData] = useState<VideoData[]>([]);

  useEffect(() => {
    let activeUrls: string[] = [];

    function loadFromIDB() {
      setIsLoading(true);
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      activeUrls = [];

      get("videos-data").then((vData) => {
        if (vData) setVideosData(vData);
      });
      // Fetch the files from IndexedDB
      get("user-files").then(async (storedFiles: File[]) => {
        if (storedFiles) {
          storedFiles.forEach((file) => activeUrls.push(URL.createObjectURL(file)));
          setFilesData(
            await Promise.all(
              storedFiles.map(async (file, index) => {
                return {
                  id: index,
                  url: activeUrls[index],
                  framerate: await getVideoFramerate(file),
                };
              }),
            ),
          );
        }
        setIsLoading(false);
      });
    }
    loadFromIDB();
    window.addEventListener("files-ready-for-compare", loadFromIDB);
    return () => {
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      window.removeEventListener("files-ready-for-compare", loadFromIDB);
    };
  }, []);

  if (!isLoading) {
    if (!filesData || filesData.length < 2) {
      return <SomethingWentWrong data="files"></SomethingWentWrong>;
    }
  }

  return <Outlet context={{ filesData, videosData, setVideosData, isLoading }} />;
}
