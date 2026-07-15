import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";
import { useOutletContext } from "react-router-dom";
import { PreviewVideo } from "./previewVideo/PreviewVideo";
import { cn } from "../../../utils/cn";

export function Preview() {
  const { filesData, videosData, isLoading } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    isLoading: boolean;
  }>();

  return (
    <div className="w-full">
      <div className={cn("bgp-boxes-base-100/8 grid w-full grid-cols-3 pt-7 pr-15 pb-4")}>
        <h1 className="col-span-1 col-start-2 text-center text-4xl"><b className="underline decoration-accent">Preview</b> and <b className="underline decoration-secondary">export</b></h1>
      </div>
      {!isLoading && <PreviewVideo filesData={filesData} videosData={videosData} />};
    </div>
  );
}
