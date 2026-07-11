import { get } from "idb-keyval";
import { useEffect, useState } from "react";
import { ScrubbableVideo } from "./ScrubbableVideo";
import { getVideoFramerate } from "../../../utils/getVideoFramerate";

type Part = "first" | "last"
export type FileData = { id: number, url: string, framerate: number }

export function SideBySideEditor({ part }: { part: Part }) {

    const [filesData, setFilesData] = useState<FileData[]>([])
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the files from IndexedDB
        get('user-files').then(async (storedFiles: File[]) => {
            if (storedFiles) {
                try {
                    setFilesData(await Promise.all(storedFiles.map(async (file, index) => {
                        return {
                            id: index,
                            url: URL.createObjectURL(file),
                            framerate: await getVideoFramerate(file),
                        }
                    })));
                }
                catch (error) {
                    console.log(error)
                }
            }
            setIsLoading(false);
        });
        return () => filesData.forEach(fileData => URL.revokeObjectURL(fileData.url))
    }, []);

    const heading = part === "first" ? "starting" : "ending"

    return <main>
        <h1 className="text-4xl my-10 text-center">Select <b className="underline decoration-info">{heading}</b> frames</h1>
        <section className="w-full mt-15 flex gap-10 justify-center items-center h-116">
            {filesData.map(fileData => <ScrubbableVideo isLoading={isLoading} fileData={fileData}></ScrubbableVideo>)}
        </section>
    </main>
}