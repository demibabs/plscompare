import { useRef, type RefObject } from "react";
import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";

export function PreviewVideo({ filesData, videosDataRef }: { filesData: FileData[], videosDataRef: RefObject<VideoData[]> }) {
    const canvasRef = useRef(null

    return <canvas ref={canvasRef} className="bg-white aspect-video w-2xl my-5" width={1920} height={1080}>

    </canvas>
}