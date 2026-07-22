import { FileUploadButton } from "./FileUploadButton";
import { StepsShowcase } from "./StepsShowcase";
import { VideoWithProgressBar } from "./VideoWithProgressBar";
import normalRouteImage from "../assets/pages/landing/hero/normal_route.jpg";
import boxCutImage from "../assets/pages/landing/hero/box_cut.jpg";
import heroVideoThumbnail from "../assets/pages/landing/hero/hero_video_thumbnail.jpg";
import heroVideo from "../assets/pages/landing/hero/hero_video.mp4";
import gridExampleImage from "../assets/pages/landing/layouts/grid_example.jpg";
import horizontalExampleImage from "../assets/pages/landing/layouts/horizontal_example.jpg";
import verticalExampleImage from "../assets/pages/landing/layouts/vertical_example.jpg";

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
        <section className="my-10 flex w-full flex-col items-center justify-center gap-5 px-10 lg:min-h-96 lg:flex-row lg:gap-15">
          <div className="flex max-w-full justify-center gap-5 not-lg:w-full lg:h-full lg:w-xs lg:flex-col">
            <figure className="indicator bg-base-200 skeleton border-base-300 rounded-box flex aspect-240/119 h-full items-center justify-center border-3 not-lg:max-w-xs not-lg:grow lg:w-full lg:max-w-xs">
              <div className="indicator-item indicator-center badge badge-error badge-sm md:badge-md border-base-300 -rotate-4 border-3 py-2 md:py-3">
                <b>normal_route.mp4</b>
              </div>
              <img src={normalRouteImage} className="rounded-box h-auto w-full min-w-0" fetchPriority="high" />
            </figure>
            <figure className="indicator bg-base-200 skeleton border-base-300 rounded-box flex aspect-240/119 h-full items-center justify-center border-3 not-lg:max-w-xs not-lg:grow lg:w-full lg:max-w-xs">
              <div className="indicator-item indicator-bottom indicator-center badge badge-sm md:badge-md lg:badge-md border-base-300 badge-warning rotate-3 border-3 py-2 md:py-3">
                <b>box_cut.mov</b>
              </div>
              <img src={boxCutImage} className="rounded-box h-auto w-full min-w-0" fetchPriority="high" />
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
          <div className="w-xl not-lg:max-w-full lg:w-xl">
            <VideoWithProgressBar src={heroVideo} poster={heroVideoThumbnail}></VideoWithProgressBar>
          </div>
        </section>
      </header>
      <StepsShowcase></StepsShowcase>
      <section className="flex w-full flex-col items-center justify-center gap-3 py-8">
        <div className="flex h-[calc((61rem*(9/16))+0.75rem)] w-5xl flex-col flex-wrap gap-3">
          <img
            className="rounded-box border-base-300 h-[calc((100%*(2/3))-0.375rem)] w-auto border-3"
            src={gridExampleImage}
          ></img>
          <img
            className="rounded-box border-base-300 h-[calc((100%*(1/3))-0.375rem)] w-auto border-3"
            src={horizontalExampleImage}
          ></img>
          <img className="rounded-box border-base-300 h-full w-auto border-3" src={verticalExampleImage}></img>
        </div>
      </section>
    </>
  );
}
