import type { ReactNode } from "react";
import { GithHubIcon } from "../../utils/GitHubIcon";
import { Link } from "react-router-dom";

export function ReadMe() {
  return (
    <main className="flex w-full flex-col items-center">
      <header className="bgp-zigZag-base-200/7 border-b-base-300 flex w-full flex-col items-center gap-3 p-10 text-center not-md:pb-15">
        <hgroup className="flex flex-col gap-3">
          <h1 className="text-main-text decoration-error text-5xl font-semibold underline">Read me!</h1>
          <p className="text-2xl">Hey, you listened.</p>
        </hgroup>
      </header>
      <section className="-mt-5 grid w-full grid-cols-[minmax(0,1fr)_clamp(0px,var(--container-xl),100%)_minmax(0,1fr)] gap-10 p-10 not-md:pt-0 xl:lg:grid-cols-[minmax(0,1fr)_clamp(0px,var(--container-3xl),100%)_minmax(0,1fr)]">
        <ul className="col-span-1 col-start-2 flex w-full flex-col gap-3">
          <ReadMeCard
            title={
              <span>
                Comparison tips{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="inline size-6 -translate-y-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
              </span>
            }
            content={<>Some advice for making better comps.</>}
            destination="comparison-tips"
          ></ReadMeCard>
          <ReadMeCard
            title={
              <span>
                Technical notes{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="inline size-6 -translate-y-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </span>
            }
            content={<>Addressing some current issues with the site, and divulging some details about how it works.</>}
            destination="technical-notes"
          ></ReadMeCard>
          <ReadMeCard
            title={
              <span>
                Acknowledgements{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="inline size-6 -translate-y-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </span>
            }
            content={<>Special thanks.</>}
            destination="acknowledgements"
          ></ReadMeCard>
        </ul>
        <aside className="card col-span-1 my-auto max-h-fit w-full min-w-0 border-3 border-white/10 bg-white/10 not-lg:col-start-2 lg:col-start-3">
          <div className="card-body text-lg">
            <p>
              If you like this project, consider leaving a star on{" "}
              <a className="text-success relative inline-block whitespace-nowrap after:absolute after:bottom-1 after:left-px after:h-0.5 after:w-[calc(100%-2px)] after:bg-current after:content-[''] hover:cursor-pointer">
                GitHub{"\u00A0"}
                <GithHubIcon size="1.5rem" className="inline -translate-y-1"></GithHubIcon>
              </a>
              .
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ReadMeCard({ title, content, destination }: { title: ReactNode; content: ReactNode; destination: string }) {

  return (
    <li>
      <Link to={destination}
        className="card card-md md:card-lg bg-base-200 hover:bg-base-100 border-base-300 bgp-ticTacToe-base-300/10 border-3"
      >
        <div className="card-body">
          <h3 className="card-title text-main-text text-2xl wrap-anywhere md:text-3xl">{title}</h3>
          <p className="text-[1.2rem] md:text-lg">{content}</p>
        </div>
      </Link>
    </li>
  );
}
