// Builds an artifact-friendly copy of dist/ (no html/head/body wrapper) into artifact/.
// Used only for the claude.ai preview; real deploys use dist/ as-is.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Kerem Özdoğan";
const scripts = [...html.matchAll(/<script[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
const styles = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g)].map((m) => m[1]);
const fonts = [...html.matchAll(/<link[^>]*href="(https:\/\/fonts\.googleapis\.com[^"]+)"[^>]*>/g)].map((m) => m[1]);

rmSync("artifact", { recursive: true, force: true });
mkdirSync("artifact", { recursive: true });
cpSync("dist/assets", "artifact/assets", { recursive: true });

const out = `<title>${title.replace(/ — .*$/, "")}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts.map((f) => `<link rel="stylesheet" href="${f}">`).join("\n")}
${styles.map((s) => `<link rel="stylesheet" href="${s}">`).join("\n")}
<style>:root{color-scheme:dark;padding:0 !important}html,body{height:100%;margin:0;background:#0b1026;overflow:hidden}</style>
<div id="root"></div>
${scripts.map((s) => `<script type="module" src="${s}"></script>`).join("\n")}
`;
writeFileSync("artifact/index.html", out);
const files = Object.fromEntries(readdirSync("artifact/assets").map((f) => [`assets/${f}`, `assets/${f}`]));
writeFileSync("artifact/files.json", JSON.stringify(files, null, 2));
console.log("artifact/index.html written:", { scripts, styles, files: Object.keys(files) });
