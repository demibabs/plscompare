import { useState } from "react";
import { cn } from "../utils/cn";

type StepInfo = { title: string; body: string };

export function StepsShowcase() {
  const [currentStep, setCurrentStep] = useState(1);

  function nextStep() {
    if (currentStep >= 3) return 1;
    else return currentStep + 1;
  }

  const stepsInfo: Record<number, StepInfo> = {
    1: {
      title: "Step 1: Set a starting frame for each clip",
      body: "Align the beginning of each video at an equivalent point.",
    },
    2: {
      title: "Step 2: Set an ending frame for each clip",
      body: "Do the same as step 1, but for a point after the important stuff has happened.",
    },
    3: {
      title: "Step 3: Voilà!",
      body: "The positioning, freeze frames and timer are done for you. All you have to do is download.",
    },
  };

  const stepButtons: React.JSX.Element[] = [];
  for (let i = 1; i <= 3; i++) {
    stepButtons.push(
      <StepButton key={i} step={i} currentStep={currentStep} setCurrentStep={setCurrentStep}></StepButton>,
    );
  }

  return (
    <section className="bg-base-200 bgp-fourPointStars-base-100/5 border-neutral/50 relative mt-3 w-full border-t-3 border-b-3 border-dashed py-2">
      <h2 className="text-main-text mt-7 text-center text-3xl">
        Use an{" "}
        <b
          className={cn(
            "decoration-success underline",
            { "decoration-info": currentStep === 2 },
            { "decoration-nice-purple": currentStep === 3 },
          )}
        >
          easy process
        </b>{" "}
        to quickly compare any clips.
      </h2>
      <section className="flex w-full justify-center">
        <div
          onClick={() => setCurrentStep(nextStep())}
          className="card card-side card-xl bg-base-300 border-neutral my-10 h-96 w-6xl overflow-hidden border-3"
        >
          <div
            className={cn(
              "card-body",
              { "bg-success text-success-content bgp-ticTacToe-base-200/3": currentStep === 1 },
              { "bg-info text-info-content bgp-diagonalLines-base-200/3 bg-size-[1rem_auto]": currentStep === 2 },
              { "bg-nice-purple text-info-content bgp-bankNote-base-200/2": currentStep === 3 },
            )}
          >
            <h3 className="card-title text-4xl">{stepsInfo[currentStep].title}</h3>
            <p className="mr-8 flex items-center pb-3">{stepsInfo[currentStep].body}</p>
            <div className="card-actions join">{stepButtons}</div>
          </div>
          <div className="bg-base-100 aspect-video">
            <figure className="flex size-full items-center justify-center">Placeholder</figure>
          </div>
        </div>
      </section>
    </section>
  );
}

function StepButton({
  step,
  currentStep,
  setCurrentStep,
}: {
  step: number;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setCurrentStep(step);
      }}
      className={cn("join-item btn btn-lg border-base-100 border-3", { "btn-warning": step === currentStep })}
    >
      {step}
    </button>
  );
}
