const root = document.documentElement;
const translate = text => window.portfolioI18n?.t(text) ?? text;
function setLocalizedText(element, text) {
  element.dataset.message = text;
  element.textContent = translate(text);
}
document.addEventListener("languagechange", () => {
  document.querySelectorAll("[data-message]").forEach(element => {
    element.textContent = translate(element.dataset.message);
  });
});
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const floatingTopLink = document.querySelector(".floating-top-link");
root.classList.add("js-enabled");
menuButton.hidden = false;

if (floatingTopLink) {
  const home = document.querySelector("#home");
  new IntersectionObserver(([entry]) => {
    const visible = !entry.isIntersecting && window.scrollY > 0;
    floatingTopLink.classList.toggle("is-visible", visible);
    floatingTopLink.setAttribute("aria-hidden", String(!visible));
    floatingTopLink.tabIndex = visible ? 0 : -1;
  }, { threshold: 0.05 }).observe(home);
}

function setMenu(open) {
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  setLocalizedText(menuButton, open ? "Close menu" : "Menu");
}
setLocalizedText(menuButton, "Menu");
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

document.querySelectorAll(".contact-copy").forEach(button => button.addEventListener("click", async () => {
  const status = button.parentElement.querySelector(".copy-status");
  document.querySelectorAll(".copy-status").forEach(element => setLocalizedText(element, ""));
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    setLocalizedText(status, "Copied");
  } catch {
    setLocalizedText(status, "Copy failed");
  }
}));

const dynamicRole = document.querySelector("#dynamic-role");
if (dynamicRole) {
  let roles = ["Full-stack Developer", "AI Engineer"].map(translate);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let roleIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  let typingTimer;

  function scheduleTyping(delay) {
    clearTimeout(typingTimer);
    if (!document.hidden && !reducedMotion.matches) typingTimer = setTimeout(typeRole, delay);
  }

  function typeRole() {
    const role = roles[roleIndex];
    characterIndex += deleting ? -1 : 1;
    dynamicRole.textContent = role.slice(0, characterIndex);

    if (!deleting && characterIndex === role.length) {
      deleting = true;
      scheduleTyping(1600);
    } else if (deleting && characterIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      scheduleTyping(300);
    } else scheduleTyping(deleting ? 40 : 75);
  }

  function syncTypingPreference() {
    clearTimeout(typingTimer);
    if (reducedMotion.matches) {
      roleIndex = 0;
      characterIndex = roles[0].length;
      deleting = false;
      dynamicRole.textContent = roles[0];
    } else scheduleTyping(350);
  }

  dynamicRole.textContent = reducedMotion.matches ? roles[0] : "";
  reducedMotion.addEventListener("change", syncTypingPreference);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(typingTimer);
    else scheduleTyping(250);
  });
  syncTypingPreference();
  document.addEventListener("languagechange", () => {
    clearTimeout(typingTimer);
    roles = ["Full-stack Developer", "AI Engineer"].map(translate);
    roleIndex = 0;
    characterIndex = roles[0].length;
    deleting = true;
    dynamicRole.textContent = roles[0];
    if (!reducedMotion.matches) scheduleTyping(1600);
  });
}

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  const fields = contactForm.querySelector(".contact-form-fields");
  const success = contactForm.querySelector(".contact-success");
  const submitButton = contactForm.querySelector(".contact-submit");
  setLocalizedText(submitButton, "Send message");
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
    setLocalizedText(submitButton, "Sending...");
    setLocalizedText(submitStatus, "");

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
      setLocalizedText(submitStatus, "The message could not be sent. Please try again.");
    } finally {
      submitButton.disabled = false;
      setLocalizedText(submitButton, "Send message");
    }
  });

  sendAnotherButton.addEventListener("click", () => {
    setLocalizedText(submitStatus, "");
    swapContactState(false);
    requestAnimationFrame(() => contactForm.querySelector("#contact-email").focus());
  });
}
if (navigation) {
  const links = [...navigation.querySelectorAll("a")];
  const indicator = document.createElement("span");
  indicator.className = "nav-indicator";
  indicator.setAttribute("aria-hidden", "true");
  navigation.prepend(indicator);

  function setActiveLink(activeLink) {
    links.forEach(link => {
      if (link === activeLink) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    indicator.style.width = `${activeLink.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  }

  setActiveLink(links[0]);
  let navigationFrame;
  let lockedLink;
  let unlockTimer;

  navigation.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    lockedLink = link;
    setActiveLink(link);
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => {
      lockedLink = undefined;
      scheduleNavigationSync();
    }, 1000);
  });

  function syncActiveLink() {
    navigationFrame = undefined;
    if (lockedLink) {
      setActiveLink(lockedLink);
      return;
    }
    let activeLink = links[0];
    const pageBottom = window.scrollY + window.innerHeight;
    const atPageBottom = pageBottom >= document.documentElement.scrollHeight - 4;
    if (atPageBottom) activeLink = links[links.length - 1];
    else if (window.scrollY > 32) {
      const headerHeight = document.querySelector(".site-header").offsetHeight;
      const probe = headerHeight + (window.innerHeight - headerHeight) * 0.35;
      links.forEach(link => {
        const section = document.querySelector(link.hash);
        if (section && section.getBoundingClientRect().top <= probe) activeLink = link;
      });
    }
    setActiveLink(activeLink);
  }

  function scheduleNavigationSync() {
    if (!navigationFrame) navigationFrame = requestAnimationFrame(syncActiveLink);
  }

  window.addEventListener("scroll", scheduleNavigationSync, { passive: true });
  window.addEventListener("resize", scheduleNavigationSync);
  window.addEventListener("pageshow", scheduleNavigationSync);
  window.addEventListener("scrollend", () => {
    lockedLink = undefined;
    clearTimeout(unlockTimer);
    scheduleNavigationSync();
  });
  scheduleNavigationSync();
}
