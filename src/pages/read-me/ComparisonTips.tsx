import { Article, ArticleHeader, ArticleGrid, ArticleCol, ArticleSection, ArticleP, ArticleH2, ArticleH3 } from "./Article";

export function ComparisonTips() {
  return (
    <main className="w-full">
      <Article>
        <ArticleHeader
          title="Comparison Tips"
          bgp="bgp-hideout-base-100/30"
          decoration="decoration-success"
        ></ArticleHeader>
        <ArticleGrid>
          <ArticleCol col={2}>
            <ArticleSection>
              <ArticleP className="text-warning">
                This site is designed to streamline the editing work that normally comes with making a comparison.
                However, the parts you have to do—getting the clips and selecting the frames—are still really important
                to get right.
              </ArticleP>
            </ArticleSection>
            <ArticleSection>
              <ArticleH2>Downloading your initial clips</ArticleH2>
              <ArticleP>
                There are generally 3 places you'll get clips from: Discord, YouTube, and your own Nintendo Switch 2.
                Discord natively allows you to download any video to your device, so it's easy to use this tool with
                Discord clips.
              </ArticleP>
              <ArticleH3>YouTube</ArticleH3>
              <ArticleP>
                If you want to get a video from YouTube, the best way is simply to screen record the portion of the YT
                video that you would like to use. Uploading videos to the site directly from YouTube is not a planned
                feature.
              </ArticleP>
              <ArticleH3>Nintendo Switch 2</ArticleH3>
              <ArticleP>
                If you want a video from your Nintendo Switch 2, first make sure you have the Nintendo Switch app
                downloaded to your mobile device. Then, on your Switch 2, go to your Album, then select the video, then
                select Upload to Smart Device. After that completes, open the Nintendo Switch app on your mobile device.
                Click the Album button on the right of the dock, click the video you want, and then press Save to
                download it to your device.
              </ArticleP>
              <ArticleH3>Avoid phone camera clips</ArticleH3>
              <ArticleP>
                It is not recommended to record clips by pointing a camera at your Switch 2 or TV. These kinds of clips
                will usually be quite blurry, making it hard to get comparison frames.
              </ArticleP>
            </ArticleSection>
            <ArticleSection>
              <ArticleH2>
                Recording <i>good</i> clips
              </ArticleH2>
              <ArticleP>
                In the case where you're the one procuring the clips (instead of just downloading someone else's),
                there's a few principles to keep in mind.
              </ArticleP>
              <ArticleP>
                The simplest but most important is to keep things equal. For example, if you're trying to get a clip to
                compare against the world record, double check you're using the exact same combo and starting with the
                same amount of coins.
              </ArticleP>
              <ArticleP>
                Another important thing is to give yourself leeway. If you stop recording (or hold the Switch 2 capture
                button) <i>immediately</i> after the strat ends, you may not have enough time to "re-align" yourself
                with the other route, making it impossible to get a good ending point for the comp. (The same principle
                applies if you start your clip late, it'll be hard to get good starting frames.) Remember that it's
                better to be safe than sorry—if you recorded too much, you can always cut out what you don't need during
                the comparison stages.
              </ArticleP>
            </ArticleSection>
            <ArticleSection>
              <ArticleH2>Selecting comparison frames</ArticleH2>
              <ArticleP>
                Choosing the frames is the most important part of making a comp, but also the hardest to get right.
              </ArticleP>
              <ArticleH3>Vehicle position</ArticleH3>
              <ArticleP>
                Firstly, you have to account for the <i>position</i> of the vehicle, ensuring that all vehicles you're
                comparing are equally progressed along the track.
              </ArticleP>
              <ArticleP>
                Best to use a visual cue near the vehicle, like a certain mark in the road, the edge of a ramp or boost
                panel, or a peg in a rail. Another good option is to tie the comparison point to a position-based event,
                like the frame the vehicle touches a coin.
              </ArticleP>
              <ArticleP>
                An acceptable but worse choice for visual cues are repeating patterns, like the grid on Rainbow Road or
                the curbs on the side of the track on Mario Circuit. With proper care and attention to detail, these can
                work as visual cues. However, their repeating nature makes it very easy to make mistakes, so they're
                best avoided except as a last resort.
              </ArticleP>
              <ArticleP>
                You may also be tempted to use the edge of the camera as a reference point. <i>In most cases</i>, this
                works fine, but for some reason, the in-game camera's FOV is not actually 100% consistent. This means
                relying on it entirely can be misleading, and you should prefer visual cues based on the position of the
                vehicle.
              </ArticleP>
              <ArticleH3>Vehicle state</ArticleH3>
              <ArticleP>
                Next, you have to account for the <i>state</i> of the vehicle. This includes things like the current
                mini-turbo charge level, whether the vehicle is in a boost, and how much time is remaining in that
                boost.
              </ArticleP>
              <ArticleP>
                Even if two vehicles are at the same position through the track, one of them might've started their
                drift at a better angle and thus will be able to charge their mini-turbo earlier (or charge to a higher
                level), which usually saves time. In such cases, wait until both vehicles have released their mini-turbo{" "}
                <i>and</i> finished the boost before ending the comparison.
              </ArticleP>
              <ArticleP>
                A similar principle applies for all boosts. Always make sure your ending frames have all vehicles either
                not in a boost, or otherwise, that each boost is the same speed with the same amount of time remaining.
                In cases where that second condition is difficult to verify, best to be safe and just wait until each
                boost has ended.
              </ArticleP>
              <ArticleH3>Cutting unnecessary gameplay</ArticleH3>
              <ArticleP>
                You should only extend a comp past its main gameplay (the parts of the clips that are intentionally
                different) if it's necessary to get a quality comparison point. Otherwise, prefer keeping comps as short
                as possible to minimize unwanted variance. In other words, try to <i>start</i> your comparison at the{" "}
                <i>last</i> good starting point, and <i>end</i> it at the <i>first</i> good ending point.
              </ArticleP>
            </ArticleSection>
            <ArticleP className="text-warning">That's all of the important stuff for now. Happy comparing :)</ArticleP>
          </ArticleCol>
        </ArticleGrid>
      </Article>
    </main>
  );
}
type imageDesc = { image: HTMLImageElement, desc: HTMLParagraphElement }
function GoodMidBad({good, mid, bad}: { good: imageDesc, mid: imageDesc, bad: imageDesc })