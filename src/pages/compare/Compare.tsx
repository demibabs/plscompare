import { get } from "idb-keyval";
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import type { FileData, VideoData } from "./sideBySideEditor/SideBySideEditor";
import { getVideoFramerate } from "../../utils/getVideoFramerate";

export function Compare() {
    const [isLoading, setIsLoading] = useState(true);
    const [filesData, setFilesData] = useState<FileData[]>([])
    const videosDataRef = useRef<VideoData[]>([])

    useEffect(() => {
        get('videos-data').then((vData) => videosDataRef.current = vData)
        const activeUrls: string[] = []
        // Fetch the files from IndexedDB
        get('user-files').then(async (storedFiles: File[]) => {
            if (storedFiles) {
                storedFiles.forEach(file => activeUrls.push(URL.createObjectURL(file)))
                setFilesData((await Promise.all(storedFiles.map(async (file, index) => {
                    return {
                        id: index,
                        url: activeUrls[index],
                        framerate: await getVideoFramerate(file),
                    }
                }))));
            }
            setIsLoading(false);
        });
        return () => activeUrls.forEach(url => URL.revokeObjectURL(url))
    }, []);
    return <Outlet context={{ filesData, videosDataRef, isLoading }} />
}