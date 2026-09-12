const root = document.documentElement;
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const themeButton = document.querySelector(".theme-toggle");
const copyButton = document.querySelector(".copy-email");
root.classList.add("js-enabled");
[menuButton, themeButton, copyButton].forEach(button => { button.hidden = false; });

function setMenu(open) {
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "Close menu" : "Menu";
}
menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
navigation.addEventListener("click", event => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

function updateThemeButton() {
  const dark = root.dataset.theme === "dark";
  themeButton.setAttribute("aria-pressed", String(dark));
  themeButton.textContent = dark ? "Light mode" : "Dark mode";
}
updateThemeButton();
themeButton.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("portfolio-theme", root.dataset.theme); } catch {}
  updateThemeButton();
});
copyButton.addEventListener("click", async () => {
  const status = document.querySelector(".status");
  try {
    await navigator.clipboard.writeText("ledangtoanthang3008@gmail.com");
    status.textContent = "Email copied.";
  } catch {
    status.textContent = "Copy unavailable. Select the email address above or click it to open your email app.";
  }
});
document.querySelector("#year").textContent = String(new Date().getFullYear());

if ("IntersectionObserver" in window) {
  const links = [...navigation.querySelectorAll("a")];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.find(entry => entry.isIntersecting);
    if (!visible) return;
    links.forEach(link => {
      if (link.hash === "#" + visible.target.id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
  links.forEach(link => observer.observe(document.querySelector(link.hash)));
}
