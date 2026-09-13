const themeRoot = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");

if (themeButton) {
  const themeLabel = themeButton.querySelector(".theme-label");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function updateThemeButton() {
    const dark = themeRoot.dataset.theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeLabel.textContent = dark ? "Light mode" : "Dark mode";
  }

  function applyTheme(theme) {
    themeRoot.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "dark" ? "#091824" : "#edf5fb";
    try { localStorage.setItem("portfolio-theme", theme); } catch {}
    updateThemeButton();
  }

  themeButton.hidden = false;
  updateThemeButton();
  themeButton.addEventListener("pointerleave", () => themeButton.classList.remove("is-switching"));
  themeButton.addEventListener("click", event => {
    const nextTheme = themeRoot.dataset.theme === "dark" ? "light" : "dark";
    themeButton.classList.add("is-switching");
    const finishMotion = () => themeButton.classList.remove("is-switching");
    requestAnimationFrame(() => {
      if (!themeButton.matches(":hover")) finishMotion();
    });

    if (!document.startViewTransition || reducedMotion.matches) {
      if (!reducedMotion.matches) {
        themeRoot.classList.add("theme-fallback");
        setTimeout(() => themeRoot.classList.remove("theme-fallback"), 400);
      }
      applyTheme(nextTheme);
      setTimeout(finishMotion, reducedMotion.matches ? 0 : 400);
      return;
    }

    const x = event.clientX || innerWidth / 2;
    const y = event.clientY || 32;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => applyTheme(nextTheme));
    transition.ready.then(() => {
      themeRoot.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
    transition.finished.then(finishMotion, finishMotion);
  });
}
