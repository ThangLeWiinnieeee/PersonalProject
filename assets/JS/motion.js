// Add animation attributes only when AOS is available.
(() => {
  if (!window.AOS) return;
  const targets = document.querySelectorAll(
    ".hero-copy > *, .portrait, #overview .section-head, #overview .card, #projects .section-head, " +
    ".project-card, #experience .section-head, #experience .timeline > .card, " +
    "#skills .section-head, #skills .card, .strengths, .contact-card, .contact-form"
  );
  targets.forEach(element => element.setAttribute("data-aos", "fade-up"));
  document.querySelectorAll(".hero-copy > *").forEach((element, index) => {
    element.setAttribute("data-aos-delay", String(Math.min(index * 100, 500)));
  });
  document.querySelector(".portrait").setAttribute("data-aos-delay", "200");
  const mobile = matchMedia("(max-width: 640px)");
  function setCardDelays() {
    document.querySelectorAll(".overview-grid, .projects-grid, .skills-grid, .timeline").forEach(group => {
      [...group.children].forEach((card, index) => {
        card.setAttribute("data-aos-delay", String(mobile.matches ? 0 : (index % 2) * 150));
      });
    });
  }
  setCardDelays();
  // A form is revealed once so scrolling never interrupts typing.
  document.querySelector(".contact-form").setAttribute("data-aos-once", "true");
  document.querySelector(".contact-form").setAttribute("data-aos-mirror", "false");

  let started = false;
  try {
    document.documentElement.classList.add("aos-starting");
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      offset: 24,
      once: false,
      mirror: true,
      startEvent: "portfolio-motion-ready"
    });
    document.documentElement.classList.add("aos-ready");
    // Paint the starting position before AOS reveals the initially visible elements.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.dispatchEvent(new Event("portfolio-motion-ready"));
      document.documentElement.classList.remove("aos-starting");
      started = true;
      AOS.refresh();
    }));
  } catch {
    document.documentElement.classList.remove("aos-starting");
    document.documentElement.classList.remove("aos-ready");
    targets.forEach(element => element.removeAttribute("data-aos"));
    return;
  }

  // Preserve positions after details expand, fonts load or the form resizes.
  const refresh = () => { if (started) AOS.refresh(); };
  mobile.addEventListener("change", () => { setCardDelays(); refresh(); });
  document.querySelectorAll("details").forEach(element => element.addEventListener("toggle", refresh));
  if (document.fonts) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
  window.addEventListener("pageshow", refresh);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", refresh);
  if ("ResizeObserver" in window) {
    let frame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    });
    observer.observe(document.querySelector("main"));
  }
})();
