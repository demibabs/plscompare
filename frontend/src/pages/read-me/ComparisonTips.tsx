import type { ReactNode } from "react";
import {
  Article,
  ArticleHeader,
  ArticleGrid,
  ArticleP,
  ArticleH2,
  ArticleH3,
  FullBleed,
  ArticleBigP,
  ArticleInfo,
} from "./Article";
import { cn } from "../../utils/cn";
import recordBestImage from "../../assets/pages/read_me/comparison_tips/examples/record/best.webp";
import recordAvoidImage from "../../assets/pages/read_me/comparison_tips/examples/record/avoid.webp";
import stateBestImage from "../../assets/pages/read_me/comparison_tips/examples/state/best.webp";
import stateOkImage from "../../assets/pages/read_me/comparison_tips/examples/state/ok.webp";
import stateAvoidImage from "../../assets/pages/read_me/comparison_tips/examples/state/avoid.webp";
import positionBestImage from "../../assets/pages/read_me/comparison_tips/examples/position/best.webp";
import positionOkImage from "../../assets/pages/read_me/comparison_tips/examples/position/ok.webp";
import positionAvoidImage from "../../assets/pages/read_me/comparison_tips/examples/position/avoid.webp";

export function ComparisonTips() {
  return (
    <main className="w-full">
      <Article>
        <ArticleHeader
          title="Comparison tips"
          bgp="bgp-hideout-base-100/30"
          decoration="decoration-success"
        ></ArticleHeader>
        <ArticleGrid>
          <ArticleBigP>
            This site is designed to streamline the editing work that normally comes with making a comparison. However,
            the parts you have to do—getting the clips and selecting the frames—are still really important to get right.
          </ArticleBigP>
          <ArticleBigP>
            Note that these tips are for if your goal is to make very accurate comps. Comparisons don't always have to
            be super accurate, and it's okay to just want to test things out without having to be frame-perfect.
          </ArticleBigP>
          <ArticleH2>Downloading your initial clips</ArticleH2>
          <ArticleP>
            There are generally 3 places you'll get clips from: Discord, YouTube, and your own Nintendo Switch 2.
            Discord natively allows you to download any video to your device, so it's easy to use this tool with Discord
            clips.
          </ArticleP>
          <ArticleH3>YouTube</ArticleH3>
          <ArticleP>
            If you want to get a video from YouTube, the best way is simply to screen record the portion of the YT video
            that you would like to use. Uploading videos to the site directly from YouTube is not a planned feature.
          </ArticleP>
          <ArticleInfo>
            <p>
              The reason why I don't plan to support YouTube directly is because it's impossible to export frames from a
              YT video client-side. The workarounds to this are complicated and break often, so I think it's easier to
              ask the user to bring their own videos.
            </p>
            <p>
              If you make comparisons often, you'll probably want the{" "}
              <a
                className="link link-success"
                href="https://www.youtube.com/playlist?list=PLL19dfwbx4VulmGUjjgX8PlBeWsg0diwu"
              >
                Current World Records
              </a>{" "}
              YouTube playlist on standby.
            </p>
          </ArticleInfo>
          <ArticleH3>Nintendo Switch 2</ArticleH3>
          <ArticleP>
            If you want a video from your Nintendo Switch 2, first make sure you have the Nintendo Switch app downloaded
            to your mobile device. Then, on your Switch 2, go to your Album, then select the video, then select Upload
            to Smart Device. After that completes, open the Nintendo Switch app on your mobile device. Click the Album
            button on the right of the dock, click the video you want, and then press Save to download it to your
            device.
          </ArticleP>
          <ArticleP>
            Note that Switch 2 captures are only 30fps. If you want 60fps footage from your own game, you'll have to
            record from your computer, which requires purchasing a capture card. While 30fps videos are slightly less
            accurate for comparisons, the difference is usually negligible.
          </ArticleP>
          <ArticleH3>Avoid phone camera clips</ArticleH3>
          <ArticleP>
            It is not recommended to record clips by pointing a camera at your Switch 2 or TV. These kinds of clips will
            usually be quite blurry, making it hard to get comparison frames.
          </ArticleP>
          <FullBleed className="bgp-diagonalStripes-base-300/30">
            <Example src={recordBestImage} value="Best">
              Recording footage directly from your game.
            </Example>
            <Example src={recordAvoidImage} value="Avoid">
              Using a camera to record your Nintendo Switch 2 screen.
            </Example>
          </FullBleed>
          <ArticleH2>
            Recording <i>good</i> clips
          </ArticleH2>
          <ArticleP>
            In the case where you're the one procuring the clips (instead of just downloading someone else's), there's a
            few principles to keep in mind.
          </ArticleP>
          <ArticleP>
            The simplest but most important is to keep things equal. For example, if you're trying to get a clip to
            compare against the world record, double check you're using the exact same combo and starting with the same
            amount of coins.
          </ArticleP>
          <ArticleP>
            Another important thing is to give yourself leeway. If you stop recording (or hold the Switch 2 capture
            button) <i>immediately</i> after the strat ends, you may not have enough time to "re-align" yourself with
            the other route, making it impossible to get a good ending point for the comp. (The same principle applies
            if you start your clip late, it'll be hard to get good starting frames.) Remember that it's better to be
            safe than sorry—if you recorded too much, you can always cut out what you don't need during the comparison
            stages.
          </ArticleP>
          <ArticleH2>Selecting comparison frames</ArticleH2>
          <ArticleP>
            Choosing the frames is the most important part of making a comp, but also the hardest to get right. In
            general, it just requires a lot of attention to detail. Below are a few specific things you should be
            looking out for.
          </ArticleP>
          <ArticleH3>Vehicle position</ArticleH3>
          <ArticleP>
            Firstly, you have to account for the <i>position</i> of the vehicle, ensuring that all vehicles you're
            comparing are equally progressed along the track. This doesn't necessarily mean they have to be in the{" "}
            <i>exact</i> same spot (for example, some horizontal variation on straightaways is fine), but it's best to
            be as close as possible.
          </ArticleP>
          <ArticleP>
            Best to use a visual cue near the vehicle, like a certain mark in the road, the edge of a ramp or boost
            panel, or a peg in a rail. Another good option is to tie the comparison point to a position-based event,
            like the frame the vehicle touches a coin (although that won't work for ghosts).
          </ArticleP>
          <ArticleP>
            An acceptable but worse choice for visual cues are repeating patterns, like the grid on Rainbow Road or the
            curbs on the side of the track on Mario Circuit. With proper care and attention to detail, these can work as
            visual cues. However, their repeating nature makes it very easy to make mistakes, so they're best avoided
            except as a last resort.
          </ArticleP>
          <ArticleP>
            You may also be tempted to use the edge of the camera as a reference point. <i>In most cases</i>, this works
            fine, but for some reason, the in-game camera's FOV is not actually 100% consistent. This means relying on
            it entirely can be misleading, and you should prefer visual cues based on the position of the vehicle.
          </ArticleP>
          <FullBleed className="bgp-signal-base-300/30">
            <Example src={positionBestImage} value="Best">
              Using a clear and distinct visual cue, like a coin.
            </Example>
            <Example src={positionOkImage} value="OK">
              Using a repeating visual cue like a curb, as long as you ensure all clips are truly in the same spot.
            </Example>
            <Example src={positionAvoidImage} value="Avoid">
              Just eyeballing it, or having to rely fully on the camera.
            </Example>
          </FullBleed>
          <ArticleH3>Vehicle state</ArticleH3>
          <ArticleP>
            Next, you have to account for the <i>state</i> of the vehicle. This includes things like the current
            mini-turbo charge level, whether the vehicle is in a boost, and how much time is remaining in that boost.
          </ArticleP>
          <ArticleP>
            Even if two vehicles are at the same position through the track, one of them might've started their drift
            earlier and thus will be able to charge their mini-turbo earlier (or charge to a higher level), which
            usually saves time. In such cases, wait until both vehicles have released their mini-turbo <i>and</i>{" "}
            finished the boost before ending the comparison.
          </ArticleP>
          <ArticleP>
            A similar principle applies for all boosts. Always make sure your ending frames have all vehicles either not
            in a boost, or otherwise, that each boost is the same speed with the same amount of time remaining. In cases
            where that second condition is difficult to verify, best to be safe and just wait until each boost has
            ended.
          </ArticleP>
          <FullBleed className="bgp-aztec-base-300/30">
            <Example src={stateBestImage} value="Best">
              Neither vehicle being in a boost or drift.
            </Example>
            <Example src={stateOkImage} value="OK">
              Both vehicles being in a boost, as long as you can verify both boosts have an equivalent amount of time
              remaining.
            </Example>
            <Example src={stateAvoidImage} value="Avoid">
              Both vehicles being in a drift, but one having a greater mini-turbo charge than the other.
            </Example>
          </FullBleed>
          <ArticleH3>Cutting unnecessary gameplay</ArticleH3>
          <ArticleP>
            You should only extend a comp past its main gameplay (the parts of the clips that are intentionally
            different) as far as <i>necessary</i> to get a quality comparison point. Otherwise, prefer keeping comps as
            short as possible to minimize variance. In other words, try to <i>start</i> your comparison at the{" "}
            <i>last</i> good starting point, and <i>end</i> it at the <i>first</i> good ending point.
          </ArticleP>
          <ArticleH2>Interpreting your results</ArticleH2>
          <ArticleP>
            It's important to remember that a single comp isn't the end-all-be-all. Because even if the comparison
            itself is perfectly made, it's still likely for the gameplay <i>within</i> to be flawed. Even world record
            runs often contain mistakes and strats done sub-optimally.
          </ArticleP>
          <ArticleP>
            Also, a small amount of imprecision is always going to be introduced by screen recorders, and video
            compression on sites like YouTube and Discord. The final timer should still generally be quite accurate to
            the footage, but if the difference is only a frame or so, you should probably treat it as a wash.
          </ArticleP>
          <ArticleP>
            With all of that said, a well-made comp can still be a great jumping-off point to figure out if a strat is
            worth further pursuing (that's why I made this site!).
          </ArticleP>
          <ArticleBigP>
            That's all for now, but if you think I missed anything, please let me know. Happy comparing :)
          </ArticleBigP>
        </ArticleGrid>
      </Article>
    </main>
  );
}

function Example({ src, value, children }: { src: string; value: "Best" | "OK" | "Avoid"; children: ReactNode }) {
  return (
    <figure className="flex max-w-[min(var(--container-xl),100%)] min-w-0 grow basis-sm flex-col gap-3">
      <div className="indicator h-fit w-full">
        <span
          className={cn(
            "badge indicator-item border-base-300 border-3 p-3",
            { "badge-success": value === "Best" },
            { "badge-warning": value === "OK" },
            { "badge-error": value === "Avoid" },
          )}
        >
          {value === "Avoid" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </span>
        <div className="rounded-box border-base-300 relative aspect-video w-full overflow-hidden border-3">
          <img src={src} className="size-full" loading="lazy"></img>
        </div>
      </div>
      <figcaption
        className={cn(
          "border-base-300/10 rounded-box w-full border-3 p-3 text-lg md:p-5 md:text-xl",
          { "bg-success text-success-content": value === "Best" },
          { "bg-warning text-warning-content": value === "OK" },
          { "bg-error text-error-content": value === "Avoid" },
        )}
      >
        <b>{value}</b>: {children}
      </figcaption>
    </figure>
  );
}
