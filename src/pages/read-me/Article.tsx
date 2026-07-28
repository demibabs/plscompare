import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useNavigate } from "react-router-dom";

export function ArticleP({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-base-content col-span-1 col-start-2 mb-3 px-10 text-lg md:text-xl", className)}>
      {children}
    </p>
  );
}
export function ArticleBigP({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-warning col-span-1 col-start-2 mb-5 px-10 text-xl md:text-2xl", className)}>{children}</p>
  );
}
export function ArticleInfo({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-box indicator bg-info/10 text-info text-md col-span-1 col-start-2 mx-auto mt-5 mb-8 flex w-[calc(100%-5rem)] flex-col gap-2 border-3 border-white/10 p-3 md:text-lg">
      <span className="indicator-item badge badge-info">
        <b>i</b>
      </span>
      {children}
    </aside>
  );
}
export function ArticleH2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-main-text col-span-1 col-start-2 mt-10 mb-5 w-full px-10 text-2xl md:text-3xl", className)}>
      {children}
    </h2>
  );
}
export function ArticleH3({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-main-text col-span-1 col-start-2 mt-5 mb-3 w-full px-10 text-xl md:text-2xl", className)}>
      {children}
    </h3>
  );
}

export function ArticleHeader({ title, bgp, decoration }: { title: string; bgp: string; decoration: string }) {
  return (
    <>
      <title>{title} | plscompare</title>
      <header
        className={cn(
          "border-base-300 bg-base-200/54 mb-20 flex w-full items-center justify-center border-b-3 p-10",
          bgp,
        )}
      >
        <h1 className={cn("text-main-text text-3xl underline md:text-4xl lg:text-5xl", decoration)}>
          <b>{title}</b>
        </h1>
      </header>
    </>
  );
}

export function ArticleGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-10 grid grid-cols-[minmax(0px,1fr)_clamp(0px,var(--container-3xl),100%)_minmax(0px,1fr)]",
        className,
      )}
    >
      {children}
      <ArticleBackButton></ArticleBackButton>
    </div>
  );
}

export function FullBleed({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("col-span-3 col-start-1 flex w-full flex-wrap justify-center gap-10 p-10", className)}>
      {children}
    </div>
  );
}

export function Article({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={cn("flex w-full flex-col items-center", className)}>{children}</article>;
}

export function ArticleBackButton() {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-lg md:btn-xl btn-primary border-base-300/20 col-span-1 col-start-2 mr-10 ml-auto w-fit border-3 not-md:mt-2"
      onClick={() => {
        void navigate("/read-me");
      }}
    >
      Back
    </button>
  );
}
