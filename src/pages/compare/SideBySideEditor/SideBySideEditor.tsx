import { set } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { ScrubbableVideo } from "./ScrubbableVideo";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { hasTimes } from "../../../utils/hasTimes";

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
  const navigate = useNavigate();
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

  let nextStep;
  if (part === "start") {
    nextStep = "Next";
  }
  if (part === "end") {
    nextStep = "Preview & export";
  }

  return (
    <main className="flex w-full flex-col items-center">
      <div
        className={cn(
          "grid w-full grid-cols-[20rem_auto_20rem] place-items-center px-16 py-5 border-b-3 border-base-300/50",
          { "bgp-boxes-base-100/8": part === "start" },
          { "bgp-diagonalStripes-base-100/8": part === "end" },
        )}
      >
        <div className="col-span-1 col-start-1 flex w-full justify-start">
          <button
            onClick={async () => {
              await set("videos-data", unsavedVideosData);
              setVideosData(unsavedVideosData);
              if (part === "start") navigate("/");
              if (part === "end") navigate("/compare/start-frame");
            }}
            className="btn btn-base-100 text-error btn-xl border-3"
          >
            Back
          </button>
        </div>

        <h1 className="text-main-text col-span-1 col-start-2 text-center text-4xl">
          Select{" "}
          <b
            className={cn("decoration-primary underline", {
              "decoration-success": part === "end",
            })}
          >
            {part}ing
          </b>{" "}
          frames
        </h1>
        <div className="col-span-1 col-start-3 flex w-full justify-end">
          <button
            onClick={async () => {
              await set("videos-data", unsavedVideosData);
              setVideosData(unsavedVideosData);
              if (part === "start") navigate("/compare/end-frame");
              if (part === "end") navigate("/compare/preview");
            }}
            className={cn("btn btn-error btn-xl btn-soft border-error border-3", {
              "btn-disabled border-0":
                unsavedVideosData.some((vData) => {
                  if (part === "start" && vData.times.start === null) return true;
                  if (part === "end" && (!hasTimes(vData) || !(vData.times.end > vData.times.start))) return true;
                }) || arePlaying.some((isPlaying) => isPlaying),
            })}
          >
            {nextStep}
          </button>
        </div>
      </div>

      <section className="my-10 flex h-fit w-full items-center justify-center gap-10">
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
