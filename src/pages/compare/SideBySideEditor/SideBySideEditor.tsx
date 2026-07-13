import { set } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { ScrubbableVideo } from "./ScrubbableVideo";
import { useRef, type Dispatch, type SetStateAction } from "react";

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
  const times = videosData.map((vData) => vData.times[part]);
  const unsavedTimes = useRef<(number | null)[]>(times);

  let nextStep;
  if (part === "start") {
    nextStep = "Next";
  }
  if (part === "end") {
    nextStep = "Preview & download";
  }

  return (
    <main className="flex w-full flex-col items-center">
      <div
        className={cn(
          "grid w-full grid-cols-3 pt-7 pr-15 pb-4",
          { "bgp-boxes-base-100/8": part === "start" },
          { "bgp-diagonalStripes-base-100/8": part === "end" },
        )}
      >
        <h1 className="col-span-1 col-start-2 text-center text-4xl">
          Select{" "}
          <b
            className={cn("decoration-info underline", {
              "decoration-secondary": part === "end",
            })}
          >
            {part}ing
          </b>{" "}
          frames
        </h1>
        <div className="flex justify-end">
          <button
            onClick={async () => {
              const newVideosData = videosData.map((vData, index) => ({
                ...vData,
                times: {
                  ...vData.times,
                  [part]: unsavedTimes.current[index],
                },
              }));
              await set("videos-data", newVideosData);
              setVideosData(newVideosData);
              if (part === "start") navigate("/compare/end-frame");
              if (part === "end") navigate("/compare/preview");
            }}
            className="btn btn-accent btn-xl btn-soft border-accent border-3"
          >
            {nextStep}
          </button>
        </div>
      </div>

      <section className="mt-15 flex h-116 w-full items-center justify-center gap-10">
        {isLoading ? (
          <div className="loading loading-xl size-24"></div>
        ) : (
          [...Array(filesData.length)].map((_, index) => (
            <ScrubbableVideo
              key={filesData[index].id}
              fileData={filesData[index]}
              videoData={videosData[index]}
              unsavedTimes={unsavedTimes}
            />
          ))
        )}
      </section>
    </main>
  );
}
