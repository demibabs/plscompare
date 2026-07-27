import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function ArticleP({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-base-content text-xl col-start-2 col-span-1 mb-3 px-10", className)}>{children}</p>;
}
export function ArticleBigP({ children, className }: { children: ReactNode, className?: string}){
  return <p className={cn("text-warning text-2xl col-start-2 col-span-1 mb-5 px-10", className)}>{children}</p>
}
export function ArticleH2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-main-text w-full text-3xl mt-10 mb-5 col-start-2 col-span-1 px-10", className)}>{children}</h2>;
}
export function ArticleH3({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-main-text w-full text-2xl mt-5 mb-3 col-start-2 col-span-1 px-10", className)}>{children}</h3>;
}

export function ArticleHeader({ title, bgp, decoration }: { title: string; bgp: string; decoration: string }) {
  return (
    <header
      className={cn("border-base-300 bg-base-200/54 flex w-full items-center justify-center border-b-3 p-10 mb-20", bgp)}
    >
      <h1 className={cn("text-main-text text-5xl underline", decoration)}><b>{title}</b></h1>
    </header>
  );
}

export function ArticleGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("grid grid-cols-[minmax(0px,1fr)_clamp(0px,var(--container-3xl),100%)_minmax(0px,1fr)]", className)}
    >
      {children}
    </div>
  );
}

export function FullBleed({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full gap-10 p-10 justify-center flex-wrap col-start-1 col-span-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Article({ children, className }: { children: ReactNode, className?: string }) {
  return <article className={cn("flex w-full flex-col items-center", className)}>{children}</article>;
}
