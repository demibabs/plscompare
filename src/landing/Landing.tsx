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
import { GithHubIcon } from "../utils/GitHubIcon";

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
            <figure className="indicator aspect-240/119 h-full not-lg:max-w-xs not-lg:grow lg:w-full lg:max-w-xs">
              <div className="indicator-item indicator-center badge badge-error badge-sm md:badge-md border-base-300 -rotate-4 border-3 py-2 md:py-3">
                <b>normal_route.mp4</b>
              </div>
              <div className="bg-base-200 skeleton border-base-300 rounded-box flex size-full items-center justify-center overflow-hidden border-3">
                <img src={normalRouteImage} className="h-auto w-full min-w-0" fetchPriority="high" />
              </div>
            </figure>
            <figure className="indicator aspect-240/119 h-full not-lg:max-w-xs not-lg:grow lg:w-full lg:max-w-xs">
              <div className="indicator-item indicator-bottom indicator-center badge badge-sm md:badge-md lg:badge-md border-base-300 badge-warning rotate-3 border-3 py-2 md:py-3">
                <b>box_cut.mov</b>
              </div>
              <div className="bg-base-200 skeleton border-base-300 rounded-box flex size-full items-center justify-center overflow-hidden border-3">
                <img src={boxCutImage} className="rounded-box h-auto w-full min-w-0" fetchPriority="high" />
              </div>
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
      <section className="border-base-300 flex w-full flex-col items-center">
        <div className="lg:bgp-polkaDots-base-100/10 not-lg:bgp-polkaDots-base-100/5 flex w-full justify-center pt-6 pb-20 not-lg:bg-size-[0.75rem_auto]">
          <p className="text text-main-text mx-10 mt-3 text-center text-2xl md:text-3xl">
            Compare <b className="decoration-error underline">several</b> clips at once—you're not limited to just two.
          </p>
        </div>
        <div className="-mt-15 flex w-full flex-col items-center justify-center gap-12 px-5 md:px-10 lg:flex-row lg:gap-10 lg:px-20">
          <div className="z-11 mt-5 grid w-4xl max-w-full grid-cols-[2fr_1fr] grid-rows-[2fr_1fr] gap-3">
            <div className="relative col-span-1 col-start-1 row-span-1 row-start-1 aspect-video h-full">
              <div className="rounded-box border-base-300 size-full overflow-hidden border-3">
                <img src={gridExampleImage} className="size-full" loading="lazy"></img>
              </div>
              <div className="badge badge-md md:badge-lg lg:badge-xl badge-warning border-base-300 absolute top-0 left-1/2 -translate-1/2 border-3">
                <b>Grid</b>
              </div>
            </div>
            <div className="relative col-span-1 col-start-1 row-span-1 row-start-2 aspect-32/9 h-full w-auto">
              <div className="rounded-box border-base-300 size-full overflow-hidden border-3">
                <img src={horizontalExampleImage} className="size-full" loading="lazy"></img>
              </div>
              <div className="badge badge-md md:badge-lg lg:badge-xl badge-error border-base-300 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-3">
                <b>Horizontal</b>
              </div>
            </div>
            <div className="relative col-span-1 col-start-2 row-span-2 row-start-1 aspect-16/27 h-full">
              <div className="rounded-box border-base-300 size-full overflow-hidden border-3">
                <img src={verticalExampleImage} className="size-full" loading="lazy"></img>
              </div>
              <div className="badge badge-md md:badge-lg lg:badge-xl badge-primary border-base-300 absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 border-3">
                <b>Vertical</b>
              </div>
            </div>
          </div>
          <div className="rounded-box bg-base-200 border-base-300 bgp-boxes-base-300/6 z-12 my-auto flex h-fit w-2xl max-w-full flex-col gap-8 border-3 p-4 text-center lg:w-xs">
            <p className="text-xl md:text-2xl">Choose the layout style that best suits your comparison.</p>
          </div>
        </div>
        <div className="bgp-fourPointStars-base-100/15 -mt-10 h-20 w-full bg-size-[0.75rem_auto] lg:bg-size-[1rem_auto]"></div>
      </section>
      <section className="bg-base-200 border-base-300 grid w-full grid-cols-3 gap-3 border-y-3 border-dashed px-20 py-10">
        <div className="card card-lg bg-base-100 border-base-300 col-span-1 col-start-1 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl">Supports all major video formats</div>
            <div className="flex flex-wrap gap-2">
              <div className="badge badge-error badge-xl badge-border badge-soft border-3">.mp4</div>
              <div className="badge badge-warning badge-xl badge-border badge-soft border-3">.mov</div>
              <div className="badge badge-xl badge-border badge-soft border-3">.mkv</div>
              <div className="badge badge-success badge-xl badge-border badge-soft border-3">.webm</div>
              <div className="badge badge-primary badge-xl badge-border badge-soft border-3">.ts</div>
              <div className="badge badge-success badge-xl badge-border badge-soft border-3">.m4v</div>
              <div className="badge badge-error badge-xl badge-border badge-soft border-3">.mka</div>
              <div className="badge badge-warning badge-xl badge-border badge-soft border-3">.mts</div>
              <div className="badge badge-xl badge-border badge-soft border-3">.m4a</div>
            </div>
          </div>
        </div>
        <div className="card card-lg bg-base-100 border-base-300 col-span-1 col-start-2 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl">Totally free and open source</div>
            <p className="h-fit text-lg">
              If you like this project, or are just curious how it works, consider visiting the project{" "}
              <span className="border-b-2 whitespace-nowrap">
                GitHub{"\u00A0"}<GithHubIcon size="1.5rem" className="inline -translate-y-1"></GithHubIcon>
              </span>
              {" "}and leaving a star.
            </p>
          </div>
        </div>
        <div className="card card-lg bg-base-100 border-base-300 col-span-1 col-start-3 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl">Supports all major video formats</div>
            <div className="flex flex-wrap gap-2">
              <div className="badge badge-error badge-xl badge-border badge-soft border-3">.mp4</div>
              <div className="badge badge-warning badge-xl badge-border badge-soft border-3">.mov</div>
              <div className="badge badge-xl badge-border badge-soft border-3">.mkv</div>
              <div className="badge badge-success badge-xl badge-border badge-soft border-3">.webm</div>
              <div className="badge badge-primary badge-xl badge-border badge-soft border-3">.ts</div>
              <div className="badge badge-success badge-xl badge-border badge-soft border-3">.m4v</div>
              <div className="badge badge-error badge-xl badge-border badge-soft border-3">.mka</div>
              <div className="badge badge-warning badge-xl badge-border badge-soft border-3">.mts</div>
              <div className="badge badge-xl badge-border badge-soft border-3">.m4a</div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-base-100 bgp-randomShapes-base-100/10 flex w-full justify-center px-10 py-3 md:py-5">
        <div className="flex w-fit max-w-full gap-5 text-2xl">
          <button className="btn btn-warning btn-lg lg:btn-xl flex items-center justify-center border-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-4 lg:size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <p>Read me!</p>
          </button>
          <button
            className="btn btn-warning btn-soft btn-lg lg:btn-xl flex items-center justify-center border-3"
            onClick={() => {
              if (window) window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-4 lg:size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            <p>Back to top</p>
          </button>
        </div>
      </section>
    </>
  );
}
