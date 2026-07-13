import { useRef, useState } from "react"
import { cn } from "../utils/cn"
import { set } from "idb-keyval"
import { useNavigate } from "react-router-dom"
import type { FileData, VideoData } from "../pages/compare/sideBySideEditor/SideBySideEditor"
import { getVideoFramerate } from "../utils/getVideoFramerate"

export function FileUploadButton() {

    const inputRef = useRef<HTMLInputElement>(null)
    const [statusMessage, setStatusMessage] = useState("")
    const navigate = useNavigate()

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        if (!event.target.files) {
            setStatusMessage("Must submit exactly 2 files.")
            event.target.value = ''
            return
        }
        const filesArray = Array.from(event.target.files)
        if (filesArray.length !== 2) {
            setStatusMessage("Must submit exactly 2 files.")
            event.target.value = ''
            return
        }
        else {
            await set('user-files', filesArray)
            const videosData: VideoData[] = filesArray.map(() => {
                return {
                    label: null,
                    times: {
                        start: null,
                        end: null
                    }
                }
            })
            await set('videos-data', videosData)
            navigate('/compare/start-frame')
        }
    }

    return <div className={cn("", { "tooltip tooltip-bottom tooltip-accent tooltip-open before:text-lg": statusMessage })} data-tip={statusMessage}>
        <button onClick={() => inputRef.current?.click()} className="btn btn-xl btn-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Upload clips
        </button>

        <input type="file" multiple ref={inputRef} className="hidden" onChange={handleFileChange}>
        </input>
    </div>

}