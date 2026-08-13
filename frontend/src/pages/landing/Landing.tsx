import { FileUploadButton } from "./FileUploadButton";
import { StepsShowcase } from "./StepsShowcase";
import { VideoWithProgressBar } from "./VideoWithProgressBar";
import normalRouteImage from "../../assets/pages/landing/hero/normal_route.webp";
import boxCutImage from "../../assets/pages/landing/hero/box_cut.webp";
import heroVideoThumbnail from "../../assets/pages/landing/hero/hero_video_thumbnail.webp";
import heroVideo from "../../assets/pages/landing/hero/hero_video.mp4";
import gridExampleImage from "../../assets/pages/landing/layouts/grid_example.webp";
import horizontalExampleImage from "../../assets/pages/landing/layouts/horizontal_example.webp";
import verticalExampleImage from "../../assets/pages/landing/layouts/vertical_example.webp";
import defaultExampleImage from "../../assets/pages/landing/layouts/default_example.webp";
import { GithHubIcon } from "../../utils/GitHubIcon";
import { DiscordIcon } from "../../utils/DiscordIcon";

export function Landing() {
  return (
    <main className="w-full">
      {/* Hero */}
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
                <img
                  src={normalRouteImage}
                  className="size-full min-w-0 object-fill"
                  fetchPriority="high"
                  alt="A player driving around the last turn of Mario Circuit."
                />
              </div>
            </figure>
            <figure className="indicator aspect-240/119 h-full not-lg:max-w-xs not-lg:grow lg:w-full lg:max-w-xs">
              <div className="indicator-item indicator-bottom indicator-center badge badge-sm md:badge-md lg:badge-md border-base-300 badge-warning rotate-3 border-3 py-2 md:py-3">
                <b>box_cut.mov</b>
              </div>
              <div className="bg-base-200 skeleton border-base-300 rounded-box flex size-full items-center justify-center overflow-hidden border-3">
                <img
                  src={boxCutImage}
                  className="size-full min-w-0 object-fill"
                  fetchPriority="high"
                  alt="A player using a shortcut to skip the last turn of Mario Circuit."
                />
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
            <VideoWithProgressBar
              src={heroVideo}
              poster={heroVideoThumbnail}
              fetchPriority="high"
              alt="The clip of the turn and the clip of the shortcut being played side-by-side."
              className="size-full object-fill"
            ></VideoWithProgressBar>
          </div>
        </section>
      </header>
      {/* Tutorial */}
      <StepsShowcase></StepsShowcase>
      {/* Layouts showcase */}
      <section className="border-base-300 flex w-full flex-col items-center">
        <div className="lg:bgp-polkaDots-base-100/10 not-lg:bgp-polkaDots-base-100/5 flex w-full justify-center pt-7 pb-20 not-lg:bg-size-[0.75rem_auto]">
          <p className="text text-main-text mx-10 mt-3 text-center text-2xl md:text-3xl">
            Compare <b className="decoration-nice-purple md:decoration-error underline">several</b> clips at once—you're
            not limited to just two.
          </p>
        </div>
        <div className="-mt-15 flex w-full flex-col items-center justify-center gap-5 px-5 md:px-10 lg:flex-row lg:gap-10 lg:px-20">
          <figure className="z-11 mt-7 w-4xl max-w-full grid-cols-[2fr_1fr] grid-rows-[2fr_1fr] flex-col gap-5 not-md:flex md:grid md:gap-3">
            <div className="relative col-span-1 col-start-1 row-span-1 row-start-1 aspect-video h-full not-md:order-2">
              <div className="rounded-box border-base-300 size-full overflow-hidden border-3">
                <img
                  src={gridExampleImage}
                  className="size-full object-fill"
                  loading="lazy"
                  alt="A showcase of the grid comparison layout style."
                ></img>
              </div>
              <div className="badge badge-xl badge-warning border-base-300 absolute top-0 left-1/2 -translate-1/2 border-3">
                <b>Grid</b>
              </div>
            </div>
            <div className="relative col-span-1 col-start-1 row-span-1 row-start-2 aspect-32/9 h-full w-auto not-md:order-3">
              <div className="rounded-box border-base-300 size-full overflow-hidden border-3">
                <img
                  src={horizontalExampleImage}
                  className="size-full object-fill"
                  loading="lazy"
                  alt="A showcase of the horizontal comparison layout style."
                ></img>
              </div>
              <div className="badge badge-xl badge-error border-base-300 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-3 not-md:top-0 md:bottom-0 md:translate-y-1/2">
                <b>Horizontal</b>
              </div>
            </div>
            <div className="relative col-span-1 col-start-2 row-span-2 row-start-1 h-full not-md:order-1 not-md:aspect-video md:aspect-16/27">
              <div className="rounded-box border-base-300 size-full overflow-hidden border-3">
                <picture>
                  <source media="(min-width: 48rem)" srcSet={verticalExampleImage} />
                  <img
                    src={defaultExampleImage}
                    className="size-full object-fill"
                    loading="lazy"
                    alt="A showcase of either the default or grid comparison layout style."
                  ></img>
                </picture>
              </div>
              <div className="badge badge-xl badge-info md:badge-primary border-base-300 absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 border-3">
                <b className="md:hidden">Default</b>
                <b className="not-md:hidden">Vertical</b>
              </div>
            </div>
          </figure>
          <div className="rounded-box bg-base-200/70 border-base-300 bgp-boxes-base-300/6 z-12 my-auto flex h-fit max-w-full flex-col gap-8 border-3 p-3 md:p-4 lg:w-xs">
            <p className="text-xl md:text-2xl">Choose the layout style that best suits your comparison.</p>
          </div>
        </div>
        <div className="bgp-fourPointStars-base-100/15 -mt-10 h-20 w-full bg-size-[0.75rem_auto] md:h-25 lg:bg-size-[1rem_auto]"></div>
      </section>
      {/* Feature cards */}
      <section className="bg-base-200 border-base-300 w-full grid-cols-3 grid-rows-2 flex-col gap-3 border-y-3 border-dashed px-5 py-10 not-md:gap-4 not-lg:flex md:px-10 lg:grid lg:px-20">
        <div className="card not-md:card-md card-lg bg-base-100 border-base-300 col-span-1 col-start-1 row-span-1 row-start-1 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl not-md:text-xl">Supports all major video formats</div>
            <div className="flex h-full flex-wrap content-center gap-2">
              <div className="badge badge-error badge-xl badge-border badge-soft border-3">.mp4</div>
              <div className="badge badge-warning badge-xl badge-border badge-soft border-3">.mov</div>
              <div className="badge badge-xl badge-border badge-soft border-3">.mkv</div>
              <div className="badge badge-success badge-xl badge-border badge-soft border-3">.webm</div>
              <div className="badge badge-primary badge-xl badge-border badge-soft border-3">.ts</div>
              <div className="badge badge-success badge-xl badge-border badge-soft border-3">.m4v</div>
              <div className="badge badge-error badge-xl badge-border badge-soft border-3">.ogv</div>
              <div className="badge badge-warning badge-xl badge-border badge-soft border-3">.mts</div>
            </div>
          </div>
        </div>
        <div className="card card-lg not-md:card-md bg-base-100 border-base-300 col-span-1 col-start-2 row-span-1 row-start-1 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl not-md:text-xl">Totally free and open source</div>
            <p className="my-auto max-h-fit text-lg">
              If you like this project, or are just curious how it works, consider visiting it on{" "}
              <a
                className="text-success relative inline-block whitespace-nowrap after:absolute after:bottom-1 after:left-px after:h-0.5 after:w-[calc(100%-2px)] after:bg-current after:content-[''] hover:cursor-pointer"
                href="https://github.com/demibabs/plscompare"
              >
                GitHub{"\u00A0"}
                <GithHubIcon size="1.5rem" className="inline -translate-y-1"></GithHubIcon>
              </a>{" "}
              and leaving a{" "}
              <span className="text-main-text">
                star{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="inline size-5 -translate-y-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                  />
                </svg>
              </span>
              .
            </p>
          </div>
        </div>
        <div className="card card-lg not-md:card-md bg-base-100 border-base-300 col-span-1 col-start-3 row-span-1 row-start-1 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl not-md:text-xl">Nothing is watermarked</div>
            <div className="relative flex size-full items-center justify-center text-3xl not-lg:py-5">
              {" "}
              <span className="text-warning opacity-30">pls</span>
              <span className="opacity-30">compare.com</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="var(--color-error)"
                className="absolute right-1/2 bottom-1/2 size-24 translate-1/2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="card card-lg bgp-diagonalStripes-[#261b25]/50 border-base-300/50 col-span-1 col-start-1 row-span-1 row-start-2 border-3 bg-size-[1.5rem_auto] not-lg:hidden"></div>
        <div className="card not-md:card-md card-lg bg-base-100 border-base-300 col-span-1 col-start-2 row-span-1 row-start-2 border-3">
          <div className="card-body">
            <div className="card-title mb-3 text-2xl not-md:text-xl">Still under construction!</div>
            <p className="my-auto max-h-fit text-lg">
              The site will receive updates and improvements in the future, so hang tight! If you have any suggestions,
              send me them on{" "}
              <a
                className="text-warning relative inline-block whitespace-nowrap after:absolute after:bottom-1 after:left-px after:h-0.5 after:w-[calc(100%-2px)] after:bg-current after:content-[''] hover:cursor-pointer"
                href="https://discord.gg/FK3QGhvqzq"
              >
                Discord{"\u00A0"}
                <DiscordIcon size="1.25rem" className="inline -translate-y-0.75"></DiscordIcon>
              </a>{" "}
              .
            </p>
          </div>
        </div>
        <div className="card card-lg bgp-diagonalStripes-[#261b25]/50 border-base-300/50 col-span-1 col-start-3 row-span-1 row-start-2 border-3 bg-size-[1.5rem_auto] not-lg:hidden"></div>
      </section>
      {/* "Scroll to top" button section */}
      <section className="bg-base-100 bgp-randomShapes-base-100/5 flex w-full justify-center px-10 py-3 md:py-5">
        <div className="flex w-fit max-w-full text-2xl">
          <button
            className="btn btn-warning btn-soft btn-lg lg:btn-xl flex items-center justify-center border-3"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
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
    </main>
  );
}
