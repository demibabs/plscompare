import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PreviewVideo } from "./previewVideo/PreviewVideo";
import { cn } from "../../../utils/cn";
import { SomethingWentWrong } from "../SomethingWentWrong";
import { CompareHeader } from "../CompareHeader";

export function Preview() {
  const { filesData, videosData } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    isLoading: boolean;
  }>();

  if (!videosData || videosData.some((vData) => vData.times.start === null)) {
    return <SomethingWentWrong data="start"></SomethingWentWrong>;
  }
  if (videosData.some((vData) => vData.times.end === null)) {
    return <SomethingWentWrong data="end"></SomethingWentWrong>;
  }

  return (
    <div className="flex w-full grow flex-col">
      <CompareHeader
        prevPage="/compare/end-frame"
        bgp="bgp-bathroomFloor-base-100/6"
        headerText={
          <>
            Preview and <b className={cn("decoration-primary underline")}>export</b>
          </>
        }
      ></CompareHeader>
      {<PreviewVideo />}
    </div>
  );
}
