// Apply the saved preference before the page paints.
(() => {
  let preference = "system";
  try { preference = localStorage.getItem("portfolio-theme") || "system"; } catch {}
  const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
})();
