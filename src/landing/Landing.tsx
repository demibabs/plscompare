import { FileUploadButton } from "./FileUploadButton";
import { StepsShowcase } from "./StepsShowcase";
import { VideoWithProgressBar } from "./VideoWithProgressBar";

export function Landing() {
  return (
    <>
      <header className="flex w-full flex-col items-center">
        <div className="bgp-polkaDots-base-100/10 w-full">
          <h1 className="text-main-text mx-auto mt-10 mb-15 w-full max-w-5xl px-10 text-center text-3xl md:text-4xl lg:px-20 lg:text-5xl">
            Create a side-by-side comparison with a timer—
            <b className="decoration-error underline">no editing knowledge needed.</b>
          </h1>
        </div>
        <div className="-mt-7">
          <FileUploadButton />
        </div>
        <section className="my-10 flex w-full flex-col items-center justify-center gap-5 px-10 lg:h-96 lg:flex-row lg:gap-15">
          <div className="flex items-center justify-center gap-5 not-lg:w-full lg:flex-col">
            <figure className="indicator bg-base-200 border-base-300 rounded-box lg:max-w-xs flex items-center justify-center border-3 not-lg:w-xs">
              <div className="indicator-item indicator-center badge badge-error badge-sm md:badge-md border-base-300 -rotate-4 border-3 py-2 md:py-3">
                <b>normal_route.mp4</b>
              </div>
              <img src="/images/hero/normal_route.jpg" className="rounded-box w-full h-auto min-w-0" />
            </figure>
            <figure className="indicator bg-base-200 border-base-300 rounded-box lg:max-w-xs lg flex items-center justify-center border-3 not-lg:w-xs">
              <div className="indicator-item indicator-bottom indicator-center badge badge-sm md:badge-md lg:badge-md border-base-300 badge-warning rotate-3 border-3 py-2 md:py-3">
                <b>box_cut.mov</b>
              </div>
              <img src="/images/hero/box_cut.jpg" className="rounded-box w-full h-auto min-w-0" />
            </figure>
          </div>
          <div className="w-5 min-w-fit not-lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="var(--color-error)"
              className="size-15"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
          <div className="max-w-xl">
            <VideoWithProgressBar src="/images/hero/hero_video.mp4"></VideoWithProgressBar>
          </div>
        </section>
        <StepsShowcase></StepsShowcase>
      </header>
    </>
  );
}
