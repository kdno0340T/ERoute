import { readFileSync } from "node:fs";
import path from "node:path";
import LegacyApp from "./LegacyApp";

const htmlPath = path.join(process.cwd(), "public", "index.html");
const documentHtml = readFileSync(htmlPath, "utf8");
const bodyMarkup = (documentHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "")
  .replace('<header class="site-header">', '<header class="site-header" style="opacity:0">')
  .replace('<h1 id="hero-title">', '<h1 id="hero-title" style="opacity:0">')
  .replace('<div class="hero-photo" role="img"', '<div class="hero-photo" role="img" style="opacity:0"');

export default function HomePage() {
  return <LegacyApp markup={bodyMarkup} />;
}
