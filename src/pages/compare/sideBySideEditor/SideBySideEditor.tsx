import { Link, useOutletContext } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { ScrubbableVideo } from "./ScrubbableVideo";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { hasTimes } from "../../../utils/hasTimes";
import { CompareHeader } from "../CompareHeader";

export type Part = "start" | "end";
export type FileData = { id: number; url: string; framerate: number; allFrameTimes: number[] };
export type VideoData = {
  label: string | null;
  times: {
    start: number | null;
    end: number | null;
  };
};

export function SideBySideEditor({ part }: { part: Part }) {
  const { filesData, videosData, setVideosData } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    setVideosData: Dispatch<SetStateAction<VideoData[]>>;
  }>();
  const [arePlaying, setArePlaying] = useState<boolean[]>(Array(filesData.length).fill(false));
  const videosRef = useRef<(HTMLVideoElement | null)[]>(Array(filesData.length).fill(null));
  const [durations, setDurations] = useState<number[]>(Array(filesData.length).fill(1));

  const prevPage = part === "start" ? "/" : "/compare/start-frame";
  const bgp = part === "start" ? "bgp-boxes-base-100/8" : "bgp-diagonalStripes-base-100/8";
  const headerText = (
    <>
      {" "}
      Select{" "}
      <b
        className={cn("decoration-primary underline", {
          "decoration-success": part === "end",
        })}
      >
        {part}ing
      </b>{" "}
      frames
    </>
  );
  const rightButtonIsDisabled =
    videosData.some((vData, index) => {
      if (
        part === "start" &&
        (vData.times.start === null || vData.times.start >= durations[index] - 1 / filesData[index].framerate)
      )
        return true;
      if (part === "end" && (!hasTimes(vData) || !(vData.times.end > vData.times.start))) return true;
    }) || arePlaying.some((isPlaying) => isPlaying);
  const nextPage = "/compare/" + (part === "start" ? "end-frame" : "preview");

  return (
    <main className="flex w-full flex-col items-center">
      <CompareHeader
        prevPage={prevPage}
        bgp={bgp}
        headerText={headerText}
        rightButton
        rightButtonIsDisabled={rightButtonIsDisabled}
        nextPage={nextPage}
      />
      {/* Video list */}
      <section className="mt-6 flex w-full flex-wrap justify-center gap-4 px-10 md:mt-10">
        {[...Array(filesData.length) as undefined[]].map((_, index) => (
          <ScrubbableVideo
            key={filesData[index].id}
            fileData={filesData[index]}
            part={part}
            videosData={videosData}
            setVideosData={setVideosData}
            arePlaying={arePlaying}
            setArePlaying={setArePlaying}
            durations={durations}
            setDurations={setDurations}
            videosRef={videosRef}
          />
        ))}
      </section>
      {/* Collapse */}
      <details className="collapse-arrow bg-base-200 border-base-300 collapse mt-2 mb-10 w-[calc(100%-5rem)] border-3">
        <summary className="collapse-title text-main-text text-2xl">
          {part === "start" ? <>New to making comparisons?</> : <>Any issues or feedback?</>}
        </summary>
        <p className="collapse-content bgp-diagonalStripes-base-300/15 text-lg pt-3">
          {part === "start" ? (
            <>
              Check out{" "}
              <Link to={"/read-me/comparison-tips"} className="link link-success">
                Comparison Tips
              </Link>{" "}
              for some (hopefully) helpful advice.
            </>
          ) : (
            <>
              Tag <span className="text-info">@crashwy</span> in the Discord server linked on the bottom right of the
              page and let me know. Your feedback is the best way for me to improve the site, so anything is appreciated! :)
            </>
          )}
        </p>
      </details>
    </main>
  );
}
