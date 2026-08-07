import { Article, ArticleBigP, ArticleGrid, ArticleH2, ArticleHeader, ArticleP } from "./Article";

export function Acknowledgements() {
  return (
    <main className="w-full">
      <Article>
        <ArticleHeader
          title="Acknowledgements"
          bgp="bgp-hideout-base-100/30"
          decoration="decoration-success"
        ></ArticleHeader>
        <ArticleGrid>
          <ArticleBigP>
            Thanks to <i>you</i> for using plscompare :)
          </ArticleBigP>
          <ArticleH2>But also...</ArticleH2>
          <ArticleP>Thanks to <span className="text-nice-purple">AprilShade</span> for recording the clips on the landing page.</ArticleP>
          <ArticleP>And thanks to everyone who's given me feedback to help me make improvements.</ArticleP>
          <ArticleP>
            If you have any feedback you'd like to give, please tag <span className="text-info">@crashwy</span> in the
            Discord server linked in the site footer. I want to keep improving the site, so anything is appreciated. Thanks!
          </ArticleP>
        </ArticleGrid>
      </Article>
    </main>
  );
}
