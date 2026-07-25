export function ComparisonTips() {
  return (
    <main className="w-full">
      <article className="flex w-full flex-col items-center">
        <header className="bgp-hideout-base-100/30 border-base-300 bg-base-200/54 flex w-full items-center justify-center border-b-3 p-10">
          <h1 className="text-main-text decoration-success text-4xl underline">Comparison tips</h1>
        </header>
        <div className="grid grid-cols-[minmax(0px,1fr)_clamp(0px,var(--container-3xl),100%)_minmax(0px,1fr)]">
          <div className="col-span-1 col-start-2 flex w-full flex-col gap-10 p-10">
            <section>
              <p className="text-warning text-2xl">
                This site is designed to streamline the editing work that normally comes with making a comparison.
                However, the parts you have to do—getting the clips and selecting the frames—are still really important
                to get right.
              </p>
            </section>
            <section className="flex flex-col gap-5">
              <h2 className="text-main-text w-full text-3xl">Getting the clips</h2>
              <p className="text-base-content text-xl">
                This section doesn't always apply, since oftentimes you will be comparing two clips that were simply
                sent on Discord and that you had no control over the creation of. Other times, though, you'll be the one
                procuring the clips, either from YouTube or from recording your own game.
              </p>
              <p className="text-base-content text-xl">
                We don't 
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
