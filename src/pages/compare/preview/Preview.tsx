import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";
import { useOutletContext } from "react-router-dom";
import { PreviewVideo } from "./previewVideo/PreviewVideo";

export function Preview() {
  const { filesData, videosData, isLoading } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    isLoading: boolean;
  }>();

  return !isLoading && <PreviewVideo filesData={filesData} videosData={videosData} />;
}
