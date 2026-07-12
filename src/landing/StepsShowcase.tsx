import { useState } from "react"
import { cn } from "../utils/cn"

type StepInfo = { title: string, body: string }

export function StepsShowcase() {
    const [currentStep, setCurrentStep] = useState(1)

    function nextStep() {
        if (currentStep >= 3) return 1
        else return currentStep + 1
    }

    const stepsInfo: Record<number, StepInfo> = {
        1: {
            title: "Step 1: Set a starting frame for each clip",
            body: "Align the beginning of each video at an equivalent point."
        },
        2: {
            title: "Step 2: Set an ending frame for each clip",
            body: "Do the same as step 1, but for a point after the important stuff has happened."
        },
        3: {
            title: "Step 3: Voilà!",
            body: "The positioning, freeze frames and timer are done for you. All you have to do is download."
        }
    }

    const stepButtons: React.JSX.Element[] = []
    for (let i = 1; i <= 3; i++) {
        stepButtons.push(
            <StepButton key={i} step={i} currentStep={currentStep} setCurrentStep={setCurrentStep}></StepButton>
        )
    }

    return <div onClick={() => setCurrentStep(nextStep())} className="card card-side card-xl bg-base-300 h-96 w-6xl my-10 overflow-hidden border-3 border-neutral">
        <div className={cn("card-body",
            { "bg-warning text-warning-content bgp-ticTacToe-base-200/3": currentStep === 1 },
            { "bg-info text-info-content bgp-diagonalLines-base-200/3 bg-size-[1rem_auto]": currentStep === 2 },
            { "bg-[#d6bdff] text-info-content bgp-bankNote-base-200/2": currentStep === 3 })}>
            <h3 className="card-title text-4xl">{stepsInfo[currentStep].title}</h3>
            <p className="flex items-center pb-3 mr-8">{stepsInfo[currentStep].body}</p>
            <div className="card-actions join">
                {stepButtons}
            </div>
        </div>
        <div className="bg-base-100 aspect-video">
            <figure className="size-full flex justify-center items-center">Placeholder</figure>
        </div>
    </div>
}

function StepButton({ step, currentStep, setCurrentStep }: { step: number, currentStep: number, setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
    return <button
        onClick={(e) => {
            e.stopPropagation()
            setCurrentStep(step)
        }}
        className={cn("join-item btn btn-lg border-3 border-base-100", { "btn-primary": step === currentStep })}>
        {step}
    </button>
}