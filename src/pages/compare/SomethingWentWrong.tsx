import { useNavigate } from "react-router-dom";
import { FileUploadButton } from "../../landing/FileUploadButton";
import type { Part } from "./sideBySideEditor/SideBySideEditor";

export function SomethingWentWrong({ data }: { data: Part | "files" | "error" | "404" }) {
  const navigate = useNavigate();

  const imageIndices = {
    start: 3,
    end: 5,
    files: 4,
    error: 6,
    "404": 7,
  };
  const partTitleText = "I think you skipped a step.";
  const titleTexts = {
    files: "Hey, you forgot your files...",
    start: partTitleText,
    end: partTitleText,
    error: "Everything just went wrong.",
    "404": "Wait, where are we?",
  };
  const partBodyText = <p>There are no {data}ing frames assigned to your clips.</p>;
  const bodyTexts = {
    files: (
      <>
        <p>Or maybe I misplaced them...</p>
        <p>Either way, you're going to need to submit some.</p>
      </>
    ),
    start: partBodyText,
    end: partBodyText,
    error: (
      <>
        <p>There was an error that caused the app to crash.</p>
        <p>
          This should never happen, so consider contacting me (@crashwy on Discord) so I can fix whatever happened here.
        </p>
      </>
    ),
    "404": (
      <>
        <p>The page you're looking for doesn't exist.</p>
        <p>Let's try again, from the top.</p>
      </>
    ),
  };
  const partButton = (
    <button className="btn btn-xl btn-error" onClick={() => navigate(`/compare/${data}-frame`)}>
      Fix
    </button>
  );
  const homeButton = (
    <button className="btn btn-xl btn-primary" onClick={() => navigate("/")}>
      Go home
    </button>
  );
  const buttons = {
    files: <FileUploadButton></FileUploadButton>,
    start: partButton,
    end: partButton,
    error: homeButton,
    "404": homeButton,
  };

  return (
    <main className="card card-side card-xl bg-base-300 my-40 w-4xl">
      <figure className="w-lg">
        <img src={`/images/error_images/error_image_${imageIndices[data]}.webp`} />
      </figure>
      <div className="card-body">
        <h1 className="card-title mb-3 text-5xl">{titleTexts[data]}</h1>
        <div className="text-lg">{bodyTexts[data]}</div>
        <div className="card-actions justify-center pt-3">{buttons[data]}</div>
      </div>
    </main>
  );
}
