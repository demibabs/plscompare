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
            I recently made some big changes to the site, so I've deleted most of this article. I plan to rewrite it soon, so hang tight :)
          </ArticleBigP>
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
