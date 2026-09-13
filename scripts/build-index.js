const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
let html = readFileSync(join(root, "index.template.html"), "utf8");

html = html.replace(/<div data-include="\.\/sections\/([\w-]+)\.html"><\/div>/g, (_, name) =>
  readFileSync(join(root, "sections", `${name}.html`), "utf8").trim()
);

writeFileSync(join(root, "index.html"), `${html.trimEnd()}\n`);
console.log("Built index.html from sections/*.html");
