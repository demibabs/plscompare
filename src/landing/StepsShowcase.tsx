import { useState } from "react";
import { cn } from "../utils/cn";
import step1WideImage from "../assets/pages/landing/steps_showcase/wide/step_1.webp";
import step2WideImage from "../assets/pages/landing/steps_showcase/wide/step_2.webp";
import step3WideImage from "../assets/pages/landing/steps_showcase/wide/step_3.webp";
import step1MobileImage from "../assets/pages/landing/steps_showcase/mobile/step_1.webp";
import step2MobileImage from "../assets/pages/landing/steps_showcase/mobile/step_2.webp";
import step3MobileImage from "../assets/pages/landing/steps_showcase/mobile/step_3.webp";

const images: Record<string, Record<number, string>> = {
  wide: {
    1: step1WideImage,
    2: step2WideImage,
    3: step3WideImage,
  },
  mobile: {
    1: step1MobileImage,
    2: step2MobileImage,
    3: step3MobileImage,
  },
};

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
      body: "Align the beginning of each video at an equivalent point. Optionally, give each a label.",
    },
    2: {
      title: "Step 2: Set an ending frame for each clip",
      body: "On the next screen, do the same as step 1, but for a point after the important stuff has happened.",
    },
    3: {
      title: "Step 3: Voilà!",
      body: "That's it. The editing work is done for you automatically, and you can export in 1 click.",
    },
  };

  const stepButtons: React.JSX.Element[] = [];
  for (let i = 1; i <= 3; i++) {
    stepButtons.push(
      <StepButton key={i} step={i} currentStep={currentStep} setCurrentStep={setCurrentStep}></StepButton>,
    );
  }

  return (
    <section className="bg-base-200 bgp-fourPointStars-base-100/5 border-neutral/50 relative mt-3 w-full border-t-3 border-b-3 border-dashed px-10 py-2">
      {/* Header above card */}
      <h2 className="text-main-text mt-7 max-w-full text-center text-2xl md:text-3xl">
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
      {/* Card */}
      <div className="relative mx-auto my-10 size-fit max-w-full">
        <div
          className={cn(
            "badge badge-xl border-base-300 absolute top-0 left-0 z-11 -translate-x-1/8 -translate-y-1/4 border-3 md:hidden",
            { "badge-success": currentStep === 1 },
            { "badge-info": currentStep === 2 },
            { "bg-nice-purple text-info-content": currentStep === 3 },
          )}
        >
          <b>Step {currentStep}</b>
        </div>
        <div
          onClick={() => setCurrentStep(nextStep())}
          className="card lg:card-side card-xl bg-base-300 border-neutral h-fit w-2xl max-w-full overflow-hidden border-3 lg:h-120 lg:w-6xl"
        >
          <div
            className={cn(
              "card-body order-2 not-md:py-5 lg:order-1 lg:min-h-full lg:w-lg",
              { "bg-success text-success-content bgp-ticTacToe-base-200/3": currentStep === 1 },
              { "bg-info text-info-content bgp-diagonalLines-base-200/3 bg-size-[1rem_auto]": currentStep === 2 },
              { "bg-nice-purple text-info-content bgp-bankNote-base-200/2": currentStep === 3 },
            )}
          >
            <h3 className="card-title not-md:hidden md:text-3xl lg:text-4xl">{stepsInfo[currentStep].title}</h3>
            <p className="flex items-center pb-3 lg:mr-8">{stepsInfo[currentStep].body}</p>
            <div className="card-actions join gap-1 md:gap-2">{stepButtons}</div>
          </div>
          <figure className="bg-base-100 order-1 flex w-full items-center justify-center p-5 not-lg:rounded-b-none lg:order-2 lg:min-h-full">
            <picture className="flex size-full items-center justify-center">
              <source media="(min-width: 48rem)" srcSet={images.wide[currentStep]} />
              <img className="h-auto w-full" src={images.mobile[currentStep]}></img>
            </picture>
          </figure>
        </div>
      </div>
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
      className={cn("join-item btn btn-sm md:btn-md lg:btn-lg border-base-100 border-3", {
        "btn-warning": step === currentStep,
      })}
    >
      {step}
    </button>
  );
}
