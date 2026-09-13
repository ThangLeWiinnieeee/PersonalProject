// Keep the English HTML as the fallback; only replace text, never interactive markup.
(() => {
  const vietnamese = window.portfolioVietnamese;
  if (!vietnamese) return;
  let language = "en";
  try { if (localStorage.getItem("portfolio-language") === "vi") language = "vi"; } catch {}
  const t = text => language === "vi" ? (vietnamese[text] ?? text) : text;
  window.portfolioI18n = { t, get language() { return language; } };
  const bindings = [];
  const originalTitle = document.title;
  bindings.push(() => { document.title = originalTitle.split(" | ").map(part => part.split(" & ").map(t).join(" & ")).join(" | "); });
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    const originalDescription = description.content;
    bindings.push(() => { description.content = t(originalDescription); });
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest("script, style, #dynamic-role, .theme-label, .menu-toggle, .copy-status, .contact-submit-status, .contact-submit, [data-experience-start]")) continue;
    const key = node.nodeValue.trim();
    const original = node.nodeValue;
    if (Object.hasOwn(vietnamese, key)) bindings.push(() => { node.nodeValue = original.replace(key, t(key)); });
  }
  document.querySelectorAll("[aria-label], [title], [placeholder], [alt]").forEach(element => {
    if (element.matches(".theme-toggle")) return;
    for (const attribute of ["aria-label", "title", "placeholder", "alt"]) {
      const key = element.getAttribute(attribute);
      if (key && Object.hasOwn(vietnamese, key)) bindings.push(() => element.setAttribute(attribute, t(key)));
    }
  });
  const themeButton = document.querySelector(".theme-toggle");
  if (!themeButton) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "language-toggle";
  const controls = document.createElement("div");
  controls.className = "header-controls";
  themeButton.before(controls);
  controls.append(button, themeButton);
  function applyLanguage() {
    document.documentElement.lang = language;
    bindings.forEach(apply => apply());
    button.textContent = language === "vi" ? "VI" : "EN";
    button.setAttribute("aria-label", language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt");
    button.title = language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt";
    document.dispatchEvent(new CustomEvent("languagechange"));
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      window.ScrollTrigger?.refresh();
    });
  }
  button.addEventListener("click", () => {
    language = language === "en" ? "vi" : "en";
    try { localStorage.setItem("portfolio-language", language); } catch {}
    applyLanguage();
  });
  applyLanguage();
})();
