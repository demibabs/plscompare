import { set } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { ScrubbableVideo } from "./ScrubbableVideo";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
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
  const { filesData, videosData, setVideosData, isLoading } = useOutletContext<{
    filesData: FileData[];
    videosData: VideoData[];
    setVideosData: Dispatch<SetStateAction<VideoData[]>>;
    isLoading: boolean;
  }>();
  const defaultUnsavedVideosData = useMemo(
    () =>
      videosData.map((vData) => {
        const newVData = { ...vData };
        newVData.times.start = vData.times.start || 0;
        return newVData;
      }),
    [videosData],
  );
  const [unsavedVideosData, setUnsavedVideosData] = useState<VideoData[]>(defaultUnsavedVideosData);
  const [arePlaying, setArePlaying] = useState<boolean[]>(Array(filesData.length).fill(false));

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
    unsavedVideosData.some((vData) => {
      if (part === "start" && vData.times.start === null) return true;
      if (part === "end" && (!hasTimes(vData) || !(vData.times.end > vData.times.start))) return true;
    }) || arePlaying.some((isPlaying) => isPlaying);
  const nextPage = "/compare/" + (part === "start" ? "end-frame" : "preview");
  const save = async () => {
    await set("videos-data", unsavedVideosData);
    setVideosData(unsavedVideosData);
  };

  return (
    <main className="flex w-full flex-col items-center">
      <CompareHeader
        prevPage={prevPage}
        bgp={bgp}
        headerText={headerText}
        rightButton
        rightButtonIsDisabled={rightButtonIsDisabled}
        nextPage={nextPage}
        save={save}
      />
      <section className="my-6 md:my-10 flex h-fit w-full flex-wrap justify-center gap-4 px-10">
        {isLoading ? (
          <div className="loading loading-xl size-24"></div>
        ) : (
          [...Array(filesData.length)].map((_, index) => (
            <ScrubbableVideo
              key={filesData[index].id}
              fileData={filesData[index]}
              part={part}
              unsavedVideosData={unsavedVideosData}
              setUnsavedVideosData={setUnsavedVideosData}
              arePlaying={arePlaying}
              setArePlaying={setArePlaying}
            />
          ))
        )}
      </section>
    </main>
  );
}
