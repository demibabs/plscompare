import { set } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { ScrubbableVideo } from "./ScrubbableVideo";
import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { hasTimes } from "../../../utils/hasTimes";
import { CompareHeader } from "../CompareHeader";

export type Part = "start" | "end";
export type FileData = { id: number; url: string; framerate: number };
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
  const videosRef = useRef<HTMLVideoElement[]>(Array(filesData.length).fill(null));
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
      <section className="my-6 flex h-fit w-full flex-wrap justify-center gap-4 px-10 md:my-10">
        {[...Array(filesData.length)].map((_, index) => (
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
    </main>
  );
}
