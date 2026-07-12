import type { FileData, VideoData } from "../sideBySideEditor/SideBySideEditor";
import { useOutletContext } from "react-router-dom";
import { PreviewVideo } from "./PreviewVideo";


export function Preview() {
    const {filesData, videosDataRef, isLoading} = useOutletContext<{filesData: FileData[], videosDataRef: React.RefObject<VideoData[]>, isLoading: boolean}>()
    return <>{!isLoading && <PreviewVideo filesData={filesData} videosDataRef={videosDataRef}></PreviewVideo>}</>
}