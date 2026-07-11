import { useEffect, useRef, useState } from "react"
import { cn } from "../../../utils/cn"
import type { FileData } from "./SideBySideEditor"

export function ScrubbableVideo({ fileData, isLoading }: { fileData: FileData, isLoading: boolean }) {
    

    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoProgress, setVideoProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    function videoPercent(time?: number) {
        return (time || videoRef.current?.currentTime || 0) * 100 / (videoRef.current?.duration || 1)
    }

    function handleTimeUpdate() {
        setVideoProgress(videoPercent())
    }

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPercent = parseFloat(e.target.value);
        setVideoProgress(newPercent);
        if (videoRef.current) {
            videoRef.current.currentTime = (newPercent / 100) * videoRef.current.duration || 0;
        }
    };

    useEffect(() => {
        if (isPlaying) videoRef.current?.play()
        else videoRef.current?.pause()
    }, [isPlaying])

    function scrub(numFrames: number) {
        if (!videoRef.current) return
        videoRef.current.currentTime += (numFrames / framerate)
    }

    const { id, url, framerate } = fileData

    const menuLiButtonClassName = "btn btn-xl px-3 mt-5 mb-2 join-item border-3 border-base-300"

    return <div className="flex flex-col items-center">
        <input type="text" className="input border-3" placeholder="Label?" />
        <div className="w-xl my-5 aspect-video flex justify-center items-center rounded-box bg-base-200">
            {isLoading ? "Loading..." : <video onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={handleTimeUpdate} ref={videoRef} src={url} className="size-full object-contain border-3 border-base-300 rounded-box"></video>}
        </div>
        <input type="range" className="range range-xs w-lg" min={0} max="100" value={videoProgress} onChange={handleScrubberChange} step="any" onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}></input>
        <menu className="join gap-1">
            <li><button onClick={() => scrub(framerate * -1)} className={cn(menuLiButtonClassName, "btn-info")}>-1s</button></li>
            <li><button onClick={() => scrub(framerate * -0.1)} className={cn(menuLiButtonClassName, "btn-secondary")}>-0.1s</button></li>
            <li><button onClick={() => scrub(-1)} className={cn(menuLiButtonClassName, "btn-primary")}>-1f</button></li>
            <li>
                <button onClick={() => setIsPlaying(!isPlaying)} className={cn(menuLiButtonClassName, "btn-accent")}>
                    {isPlaying ?
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                    }
                </button></li>
            <li><button onClick={() => scrub(1)} className={cn(menuLiButtonClassName, "btn-primary")}>+1f</button></li>
            <li><button onClick={() => scrub(framerate * 0.1)} className={cn(menuLiButtonClassName, "btn-secondary")}>+0.1s</button></li>
            <li><button onClick={() => scrub(framerate)} className={cn(menuLiButtonClassName, "btn-info")}>+1s</button></li>
        </menu>
    </div>
}