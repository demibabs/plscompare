import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useNavigate } from "react-router-dom";

export function CompareHeader({
  prevPage,
  bgp,
  headerText,
  rightButton,
  rightButtonIsDisabled,
  nextPage,
}: {
  prevPage: string;
  bgp: string;
  headerText: ReactNode;
  rightButton?: boolean;
  rightButtonIsDisabled?: boolean;
  nextPage?: string;
}) {
  const navigate = useNavigate();
  const buttonClassName = "btn btn-md md:btn-xl border-3";
  return (
    <div
      className={cn(
        "border-base-300/50 grid w-full grid-cols-[1fr_auto_1fr] place-items-center border-b-3 px-6 py-5 md:px-16",
        bgp,
      )}
    >
      <div className="col-span-1 col-start-1 flex w-full justify-start">
        <button
          onClick={() => {
            navigate(prevPage);
          }}
          className={cn(buttonClassName, "btn-base-100 border-error/40 text-error")}
        >
          Back
        </button>
      </div>
      <h1 className="text-main-text col-span-1 col-start-2 w-full px-5 text-center text-2xl md:text-4xl">
        {headerText}
      </h1>
      <div className="col-span-1 col-start-3 flex w-full justify-end">
        {rightButton && nextPage ? (
          <button
            onClick={() => {
              navigate(nextPage);
            }}
            className={cn(buttonClassName, "btn-error btn-soft border-error", {
              "btn-disabled border-0": rightButtonIsDisabled,
            })}
          >
            Next
          </button>
        ) : (
          <button className={cn(buttonClassName, "pointer-events-none opacity-0")}></button>
        )}
      </div>
    </div>
  );
}
