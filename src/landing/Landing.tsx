import { FileUploadButton } from "./FileUploadButton";
import { StepsShowcase } from "./StepsShowcase";

export function Landing() {
    return <>
        <header className="flex flex-col items-center">
            <div className="bgp-polkaDots-base-100/10">
                <h1 className="text-5xl mt-10 mb-15 mx-70 text-center">
                    Create a side-by-side comparison with a timer—
                    <b className="underline decoration-primary">
                        no editing knowledge needed.
                    </b>
                </h1>
            </div>
            <div className="-mt-7">
                <FileUploadButton />
            </div>
            <section className="h-96 w-full my-10 flex items-center justify-center gap-15">
                <div className="flex flex-col gap-5">
                    <div className="indicator">
                        <figure className="indicator bg-base-200 border-3 border-base-300 rounded-box w-xs aspect-video flex justify-center items-center">
                            <div className="indicator-item indicator-start badge badge-accent -rotate-4">top_path_cut.mp4</div>
                            <span>Placeholder</span>
                        </figure>
                    </div>
                    <div className="indicator">
                        <figure className="indicator bg-base-200 border-3 border-base-300 rounded-box w-xs aspect-video flex justify-center items-center">
                            <div className="indicator-item indicator-bottom badge badge-warning rotate-3">alternate_route.mov</div>
                            <span>Placeholder</span>
                        </figure>
                    </div>                    
                </div>
                <div className="w-5 min-w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--color-secondary)" className="size-15">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </div>
                <figure className="bg-base-200 border-3 border-base-300 rounded-box w-xl aspect-video flex justify-center items-center">Placeholder</figure>
            </section>
            <section className="py-2 mt-3 bg-base-200 w-full relative bgp-fourPointStars-base-100/5 border-b-3 border-t-3 border-dashed border-neutral/50">
                <h2 className="text-3xl text-center mt-7">
                    Use an <b className="underline decoration-accent">easy process</b> to quickly compare any two clips.
                </h2>
                <section className="w-full flex justify-center">
                    <StepsShowcase />
                </section>
            </section>
        </header>
    </>
}