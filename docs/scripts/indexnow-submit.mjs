// Submit the site's URLs to IndexNow (Bing, Yandex, Seznam, Naver…) so changes
// are picked up within minutes instead of waiting for a recrawl.
//
// Reads the URLs from the built sitemap (docs/build/sitemap.xml), so run it
// AFTER `pnpm build`. The deploy workflow runs it on every deploy; you can also
// run it by hand: `pnpm --filter el-form-docs indexnow`.
//
// IndexNow verifies ownership by fetching keyLocation and checking it equals KEY,
// so the matching key file must be live at https://elform.dev/<KEY>.txt. On the
// very first deploy (before that file is live) the API returns a non-2xx — that's
// expected and harmless; subsequent deploys verify fine.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KEY = "f287c939a77312e6e3654234b5d8e62d";
const HOST = "elform.dev";
const sitemapPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../build/sitemap.xml");

if (!existsSync(sitemapPath)) {
  console.log(`[indexnow] no sitemap at ${sitemapPath} — build the docs first. Skipping.`);
  process.exit(0);
}

const xml = readFileSync(sitemapPath, "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (urls.length === 0) {
  console.log("[indexnow] sitemap has no <loc> URLs; skipping.");
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  }),
});

console.log(`[indexnow] submitted ${urls.length} URLs -> HTTP ${res.status}`);
if (!res.ok) {
  console.log("[indexnow] non-2xx is expected on the first deploy (before the key file is live); not failing the build.");
}
