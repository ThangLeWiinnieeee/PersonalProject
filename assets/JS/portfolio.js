const root = document.documentElement;
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const themeButton = document.querySelector(".theme-toggle");
root.classList.add("js-enabled");
[menuButton, themeButton].forEach(button => { button.hidden = false; });

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
document.querySelectorAll(".contact-copy").forEach(button => button.addEventListener("click", async () => {
  const status = button.parentElement.querySelector(".copy-status");
  document.querySelectorAll(".copy-status").forEach(element => { element.textContent = ""; });
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    status.textContent = "Copied";
  } catch {
    status.textContent = "Copy failed";
  }
}));

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  const fields = contactForm.querySelector(".contact-form-fields");
  const success = contactForm.querySelector(".contact-success");
  const submitButton = contactForm.querySelector(".contact-submit");
  const submitStatus = contactForm.querySelector(".contact-submit-status");
  const sendAnotherButton = contactForm.querySelector(".send-another");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function swapContactState(showSuccess) {
    const hide = showSuccess ? fields : success;
    const show = showSuccess ? success : fields;
    const completeSwap = () => {
      hide.hidden = true;
      show.hidden = false;
      if (showSuccess) contactForm.classList.add("is-success");
      else contactForm.classList.remove("is-success");

      if (window.gsap && !reduceMotion.matches) {
        const timeline = gsap.timeline();
        timeline.fromTo(show, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .45, ease: "power2.out" });
        if (showSuccess) {
          timeline
            .fromTo(".success-check-ring", { strokeDashoffset: 252 }, { strokeDashoffset: 0, duration: .65, ease: "power2.out" }, "<")
            .fromTo(".success-check-mark", { strokeDashoffset: 64 }, { strokeDashoffset: 0, duration: .45, ease: "power2.out" }, "-=.25")
            .fromTo(success.querySelectorAll("h3, p, button"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .35, stagger: .08, ease: "power2.out" }, "-=.2");
        }
      }
    };

    if (window.gsap && !reduceMotion.matches) {
      gsap.to(hide, { autoAlpha: 0, y: -12, duration: .25, ease: "power1.in", onComplete: completeSwap });
    } else completeSwap();
  }

  contactForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    submitStatus.textContent = "";

    try {
      const endpoint = contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm)
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== "true")) throw new Error("Submission failed");
      contactForm.reset();
      swapContactState(true);
    } catch {
      submitStatus.textContent = "The message could not be sent. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  });

  sendAnotherButton.addEventListener("click", () => {
    submitStatus.textContent = "";
    swapContactState(false);
    requestAnimationFrame(() => contactForm.querySelector("#contact-email").focus());
  });
}
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
