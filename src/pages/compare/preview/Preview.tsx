import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";
import { useOutletContext } from "react-router-dom";
import { PreviewVideo } from "./previewVideo/PreviewVideo";
import { cn } from "../../../utils/cn";
import { SomethingWentWrong } from "../SomethingWentWrong";
import { CompareHeader } from "../CompareHeader";

export function Preview() {
  const { videosData } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    isLoading: boolean;
  }>();

  if (videosData.some((vData) => vData.times.start === null)) {
    return <SomethingWentWrong data="start"></SomethingWentWrong>;
  }
  if (videosData.some((vData) => vData.times.end === null)) {
    return <SomethingWentWrong data="end"></SomethingWentWrong>;
  }

  return (
    <>
      <title>Preview | plscompare</title>
      <main className="flex w-full grow flex-col items-center">
        <CompareHeader
          prevPage="/compare/end-frame"
          bgp="bgp-bathroomFloor-base-100/6"
          headerText={
            <>
              Preview and <b className={cn("decoration-primary underline")}>export</b>
            </>
          }
        ></CompareHeader>
        <PreviewVideo />
        {/* Info card */}
        <section className="bg-info/10 border-info/10 text-info rounded-box indicator mb-5 w-2xl max-w-[calc(100%-5rem)] flex-col gap-3 border-3 p-4 text-lg md:text-xl">
          <span className="badge badge-info indicator-item">
            <b>i</b>
          </span>
          <p>
            Note that this is just a preview. You might see some desync due to browser lag, but it won't be present in
            the export. That said, <i>the final timers you see in the preview are accurate</i>.
          </p>
          <p>
            Also, remember the final timer represents time saved over the slowest clip. So the bigger the green number,
            the faster the clip is.
          </p>
        </section>
      </main>
    </>
  );
}
