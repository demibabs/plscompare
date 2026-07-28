import {
  Article,
  ArticleBigP,
  ArticleGrid,
  ArticleH2,
  ArticleHeader,
  ArticleInfo,
  ArticleP,
} from "./Article";

export function TechnicalNotes() {
  return (
    <main className="w-full">
      <Article>
        <ArticleHeader
          title="Technical notes"
          bgp="bgp-circlesAndSquares-base-300/10"
          decoration="decoration-success"
        ></ArticleHeader>
        <ArticleGrid>
          <ArticleBigP>
            This is meant to be a more in-depth explanation of some of the site's features and issues.
          </ArticleBigP>
          <ArticleH2>Browser support</ArticleH2>
          <ArticleP>
            This site is generally supported on modern Chromium and WebKit (Safari) based browsers, both on PC and
            mobile (although I can't promise every single one). It is not supported on Firefox (some features might
            work, but exporting doesn't).
          </ArticleP>
          <ArticleP>
            Plscompare is fully client-side, meaning all of the video processing happens directly on your browser rather
            than on a server. This allows me to run the site for free, without having to add ads or ask for donations.
            But it also comes with some downsides, namely inconsistency.
          </ArticleP>
          <ArticleP>
            Making a tool like this on the web is inherently difficult, because the browser APIs it relies on can work
            wildly inconsistently between browsers, versions and devices. The best way you can help me is by trying it
            out yourself and letting me know how it is. I want this to be a tool anyone can use, so making browser
            support robust is one of my #1 priorities.
          </ArticleP>
          <ArticleP>
            If something doesn't work for you, or you encounter strange bugs, or you just have <i>any</i> feedback in
            general, please tag <span className="text-info">@crashwy</span> in the Discord server linked in the site footer. It would help me out a ton
            towards improving it.
          </ArticleP>
          <ArticleH2>Exports</ArticleH2>
          <ArticleP>
            Video compositing is a fairly computationally intensive task for a web browser, meaning exports can be slow
            if your device has a poor GPU.
          </ArticleP>
          <ArticleInfo>
            <p>
              Privacy settings can also slow down exports for some reason. For example, when I turned off "Advanced
              Tracking and Fingerprinting Protection" in my Safari settings on iPhone, exporting became significantly
              faster. I have no idea why (this site has no fingerprinting or anything of the sort).
            </p>
          </ArticleInfo>
          <ArticleH2>Files</ArticleH2>
          <ArticleP>
            Thanks to the fact all processing happens client-side, I have no reason to limit the number of videos or the
            total file size you can submit. It's not infinite, though, it just depends on your browser rather than my app.
            You may have trouble exporting if you send a tremendous amount of files. That said, considering a
            30-second switch clip is around 40mb (and way less if sent through Discord, thanks to their compression),
            you're unlikely to encounter any file size issues unless you are <i>dangerously</i> low on storage space.
          </ArticleP>
          <ArticleP>
            Thanks to the amazing JS library{" "}
            <a href="https://mediabunny.dev" className="link link-success">
              Mediabunny
            </a>
            , which this site relies on, pretty much any video file type is supported, so you don't have to worry about
            that either.
          </ArticleP>
          <ArticleH2>Timer</ArticleH2>
          <ArticleP>
            If you pay attention to the final timers of videos, it may be confusing why the timer often isn't at a 30th
            or 60th of a second interval, like you'd expect on a Switch 2 game, especially one that doesn't lag, like
            MKWorld. That's just because screen recordings often aren't a perfect 30 or 60 FPS (especially after having
            been compressed by Discord). They might be something like 29.5 or 59.5. This isn't noticeable when viewing,
            but it will be picked up by a tool like this, which relies on precise video timestamps.
          </ArticleP>
          <ArticleH2>Learn more</ArticleH2>
          <ArticleP>
            This project is fully open source, so you can see all the code, the tech stack I used, and even run your own local version from{" "}
            <a className="link link-success" href="https://github.com/demibabs/plscompare">the GitHub repository.</a>
          </ArticleP>
          <ArticleBigP>Thanks for reading :)</ArticleBigP>
        </ArticleGrid>
      </Article>
    </main>
  );
}
