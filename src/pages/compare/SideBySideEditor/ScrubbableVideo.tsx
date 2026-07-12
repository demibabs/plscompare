import { useEffect, useRef, useState } from "react"
import { cn } from "../../../utils/cn"
import type { FileData, Part, VideoData } from "./SideBySideEditor"

export function ScrubbableVideo({ fileData, videosDataRef, part }: { fileData: FileData, videosDataRef: React.RefObject<VideoData[]>, part: Part }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoProgress, setVideoProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [wasPlaying, setWasPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasLoadedMetadata, setHasLoadedMetadata] = useState(false)
    const [duration, setDuration] = useState(1)

    function handleTimeUpdate() {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime
            setVideoProgress(currentTime)
            videoRef.current.requestVideoFrameCallback((_, metadata) => {
                videosDataRef.current[id][`${part}Time`] = metadata.mediaTime
            })
        }
    }

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value)
        setVideoProgress(newTime)
        if (videoRef.current) {
            videoRef.current.currentTime = newTime
            videoRef.current.requestVideoFrameCallback((_, metadata) => {
                videosDataRef.current[id][`${part}Time`] = metadata.mediaTime
            })
        }
    }

    useEffect(() => {
        if (isPlaying) videoRef.current?.play()
        else videoRef.current?.pause()
    }, [isPlaying])

    useEffect(() => {
        if (isDragging) videoRef.current?.pause()
        if (!isDragging && wasPlaying) videoRef.current?.play()
    }, [isDragging, wasPlaying])

    function scrub(numSeconds: number) {
        if (!videoRef.current) return
        videoRef.current.currentTime += numSeconds
    }

    function handleLoadedMetadata() {
        setHasLoadedMetadata(true)
        if (videoRef.current) setDuration(videoRef.current.duration)
    }

    const { id, url, framerate } = fileData

    const menuLiButtonClassName = "btn btn-xl px-3 mt-5 mb-2 join-item border-3 border-base-300"

    return <div className="flex flex-col items-center">
        <input type="text" className="input border-3" placeholder="Label?" />
        <div className="skeleton indicator w-xl my-5 aspect-video flex justify-center items-center rounded-box bg-base-200">
            {isLoading && <div className="size-12 indicator-item indicator-center indicator-middle loading" />}
            <video onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onCanPlay={() => setIsLoading(false)} onTimeUpdate={handleTimeUpdate} ref={videoRef} src={url} className="size-full object-contain border-3 border-base-300 rounded-box">j</video>
        </div>
        <input type="range" className="range range-xs w-lg" min={0} max={duration || 1} value={videoProgress} onChange={handleScrubberChange} step="any" onMouseDown={() => { setIsDragging(true); setWasPlaying(isPlaying) }} onMouseUp={() => setIsDragging(false)}></input>
        <menu className="join gap-1">
            <li><button onClick={() => scrub(-1)} className={cn(menuLiButtonClassName, "btn-info")}>-1s</button></li>
            <li><button onClick={() => scrub(-0.1)} className={cn(menuLiButtonClassName, "btn-secondary")}>-0.1s</button></li>
            <li><button onClick={() => scrub(-1 / framerate)} className={cn(menuLiButtonClassName, "btn-primary")}>-1f</button></li>
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
            <li><button onClick={() => scrub(1 / framerate)} className={cn(menuLiButtonClassName, "btn-primary")}>+1f</button></li>
            <li><button onClick={() => scrub(0.1)} className={cn(menuLiButtonClassName, "btn-secondary")}>+0.1s</button></li>
            <li><button onClick={() => scrub(1)} className={cn(menuLiButtonClassName, "btn-info")}>+1s</button></li>
        </menu>
    </div>
}