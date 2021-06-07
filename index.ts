import fs from "fs";
import fetch from "node-fetch";
import parser from "xml2json";

const FEED_URL_EN = "https://blog.codesigh.com/rss.xml";
const FEED_URL_PL = "https://blog.codesigh.com/pl/rss.xml";
const TAG_OPEN = `<!-- FEED-START -->`;
const TAG_CLOSE = `<!-- FEED-END -->`;

interface LatestPostsProps {
    title: string;
    link: string;
}

const fetchArticles = async (lang: string) => {
  const articles = await fetch(lang === 'en' ? FEED_URL_EN : FEED_URL_PL);
  const articlesText = await articles.text();
  const articlesJSON = parser.toJson(articlesText);
  const latestPosts = JSON.parse(articlesJSON).rss.channel.item.slice(0, 5);

  return latestPosts.map(({ title, link }: LatestPostsProps) => `- [${title}](${link})`).join("\n");
};

async function main() {
  const readme = fs.readFileSync("./README.md", "utf8");
  const indexBefore = readme.indexOf(TAG_OPEN) + TAG_OPEN.length;
  const indexAfter = readme.indexOf(TAG_CLOSE);
  const readmeContentChunkBreakBefore = readme.substring(0, indexBefore);
  const readmeContentChunkBreakAfter = readme.substring(indexAfter);

  const postsEn = await fetchArticles('en');
  const postsPl = await fetchArticles('pl');

  const readmeNew = `
${readmeContentChunkBreakBefore}
ENGLISH ARTICLES
${postsEn}
${readmeContentChunkBreakAfter}

${readmeContentChunkBreakBefore}
POLISH ARTICLES
${postsPl}
${readmeContentChunkBreakAfter}
`;

  fs.writeFileSync("./README.md", readmeNew.trim());
}

try {
  main();
} catch (error) {
  console.error(error);
}