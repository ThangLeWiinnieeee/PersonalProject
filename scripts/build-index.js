const { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const templatePath = join(root, "index.template.html");
const production = process.argv.includes("--production");
let html = readFileSync(templatePath, "utf8");
let sectionCount = 0;

html = html.replace(/<div data-include="\.\/sections\/([\w-]+)\.html"><\/div>/g, (_, name) => {
  const sectionPath = join(root, "sections", `${name}.html`);
  if (!existsSync(sectionPath)) throw new Error(`Missing section: sections/${name}.html`);
  sectionCount += 1;
  return readFileSync(sectionPath, "utf8").trim();
});

if (!sectionCount || html.includes("data-include=")) {
  throw new Error("Build stopped: one or more section placeholders were not rendered.");
}

const output = `${html.trimEnd()}\n`;

if (production) {
  const dist = join(root, "dist");
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, "index.html"), output);
  cpSync(join(root, "assets"), join(dist, "assets"), { recursive: true });
  cpSync(join(root, "projects"), join(dist, "projects"), { recursive: true });
  if (existsSync(join(root, "_headers"))) cpSync(join(root, "_headers"), join(dist, "_headers"));
  console.log(`Built production site in dist/ with ${sectionCount} sections.`);
} else {
  writeFileSync(join(root, "index.html"), output);
  console.log(`Built index.html with ${sectionCount} sections.`);
}
