import { FileUploadButton } from "./FileUploadButton";
import { StepsShowcase } from "./StepsShowcase";
import { VideoWithProgressBar } from "./VideoWithProgressBar";

export function Landing() {
  return (
    <>
      <header className="flex flex-col items-center">
        <div className="bgp-polkaDots-base-100/10">
          <h1 className="text-main-text mx-70 mt-10 mb-15 text-center text-5xl">
            Create a side-by-side comparison with a timer—
            <b className="decoration-error underline">no editing knowledge needed.</b>
          </h1>
        </div>
        <div className="-mt-7">
          <FileUploadButton />
        </div>
        <section className="my-10 flex h-96 w-full items-center justify-center gap-15">
          <div className="flex flex-col gap-5">
            <div>
              <figure className="indicator bg-base-200 border-base-300 rounded-box flex aspect-video w-xs items-center justify-center border-3">
                <div className="indicator-item indicator-start badge badge-error py-3 border-base-300 -rotate-4 border-3">
                  <b>normal_route.mp4</b>
                </div>
                <img src="/images/hero/normal_route.jpg" className="rounded-box" />
              </figure>
            </div>
            <div>
              <figure className="indicator bg-base-200 border-base-300 rounded-box flex aspect-video w-xs items-center justify-center border-3">
                <div className="indicator-item indicator-bottom badge border-base-300 py-3 badge-warning rotate-3 border-3">
                  <b>box_cut.mov</b>
                </div>
                <img src="/images/hero/box_cut.jpg" className="rounded-box" />
              </figure>
            </div>
          </div>
          <div className="w-5 min-w-fit">
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
          <div className="w-xl">
            <VideoWithProgressBar src="/images/hero/hero_video.mp4"></VideoWithProgressBar>
          </div>
        </section>
        <StepsShowcase></StepsShowcase>
      </header>
    </>
  );
}
