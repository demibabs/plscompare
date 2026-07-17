import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PreviewVideo } from "./previewVideo/PreviewVideo";
import { cn } from "../../../utils/cn";
import { SomethingWentWrong } from "../SomethingWentWrong";

export function Preview() {
  const { filesData, videosData, isLoading } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    isLoading: boolean;
  }>();

  const navigate = useNavigate();

  if (!videosData || videosData.some((vData) => vData.times.start === null)) {
    return <SomethingWentWrong data="start"></SomethingWentWrong>;
  }
  if (videosData.some((vData) => vData.times.end === null)) {
    return <SomethingWentWrong data="end"></SomethingWentWrong>;
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "bgp-bathroomFloor-base-100/6 border-base-300/50 grid w-full grid-cols-[20rem_auto_20rem] place-items-center border-b-3 px-16 py-5 bg-size-[2rem]",
        )}
      >
        <div className="col-span-1 col-start-1 flex w-full justify-start">
          <button
            onClick={async () => {
              navigate("/compare/end-frame");
            }}
            className="btn btn-base-100 text-error btn-xl border-3"
          >
            Back
          </button>
        </div>

        <h1 className="text-main-text col-span-1 col-start-2 text-center text-4xl">
          Preview and <b className={cn("decoration-primary underline")}>export</b>
        </h1>
      </div>
      {!isLoading && <PreviewVideo filesData={filesData} videosData={videosData} />}
    </div>
  );
}
