import { set } from "idb-keyval";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { ScrubbableVideo } from "./ScrubbableVideo";

export type Part = "start" | "end"
export type FileData = { id: number, url: string, framerate: number }
export type VideoData = {
    label: string | null
    startTime: number | null
    endTime: number | null
}

export function SideBySideEditor({ part }: { part: Part }) {
    const { filesData, videosDataRef, isLoading } = useOutletContext<{ filesData: FileData[], videosDataRef: React.RefObject<VideoData[]>, isLoading: boolean }>()
    const navigate = useNavigate()

    let nextStep
    if (part === "start") {
        nextStep = "Next"
    }
    if (part === "end") {
        nextStep = "Preview & download"
    }

    return <main className="flex flex-col items-center w-full">
        <div className={cn("grid grid-cols-3 pt-7 pb-4 pr-15 w-full", { "bgp-boxes-base-100/8": part === "start" }, { "bgp-diagonalStripes-base-100/8": part === "end" })}>
            <h1 className="col-start-2 col-span-1 text-4xl text-center">Select <b className={cn("underline decoration-info", { "decoration-secondary": part === "end" })}>{part}ing</b> frames</h1>
            <div className="flex justify-end">
                <button
                    onClick={async () => {
                        await set('videos-data', videosDataRef.current)
                        if (part === "start") navigate("/compare/end-frame")
                        if (part === "end") navigate("/compare/preview")
                    }}
                    className="btn btn-accent btn-xl btn-soft border-3 border-accent">
                    {nextStep}
                </button>
            </div>
        </div>

        <section className="w-full mt-15 flex gap-10 justify-center items-center h-116">
            {isLoading ? <div className="loading loading-xl size-24"></div>
                : filesData.map(fileData => <ScrubbableVideo key={fileData.id} fileData={fileData} videosDataRef={videosDataRef} part={part}></ScrubbableVideo>)
            }
        </section>
    </main>
}