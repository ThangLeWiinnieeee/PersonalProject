// Content is visible by default when the animation CDN is unavailable.
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({
    motion: "(prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 640px)"
  }, context => {
    if (!context.conditions.motion) return;
    const targets = gsap.utils.toArray(
      ".hero-copy > *, .portrait, #overview .section-head, #overview .card, " +
      "#projects .section-head, .project-card, #experience .section-head, " +
      "#experience .timeline > .card, #skills .section-head, #skills .card, " +
      ".strengths, .contact-layout > div > p, .contact-layout > div > h2, .contact-card, .contact-form, " +
      ".case-hero > *, .case-study > aside, .case-study article > section"
    );
    const triggers = [];
    targets.forEach(element => {
      const siblings = [...element.parentElement.children];
      let delay = 0;
      if (element.parentElement.matches(".hero-copy")) delay = Math.min(siblings.indexOf(element) * 0.1, 0.5);
      else if (element.matches(".portrait")) delay = 0.2;
      else if (element.matches(".contact-layout > div > p, .contact-layout > div > h2"))
        delay = siblings.indexOf(element) * 0.1;
      else if (element.parentElement.matches(".case-hero")) delay = siblings.indexOf(element) * 0.14;
      else if (!context.conditions.mobile && element.parentElement.matches(".overview-grid, .projects-grid, .skills-grid"))
        delay = (siblings.indexOf(element) % 2) * 0.15;
      let animated = false;
      const reveal = () => {
        if (element.matches(".contact-form") && animated) return;
        animated = true;
        gsap.killTweensOf(element);
        gsap.fromTo(element, {
          opacity: 0,
          y: context.conditions.mobile ? 20 : 40
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
          clearProps: "opacity,transform"
        });
      };
      triggers.push(ScrollTrigger.create({
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        onEnter: reveal,
        onEnterBack: reveal,
        invalidateOnRefresh: true
      }));
    });
    return () => {
      triggers.forEach(trigger => trigger.kill());
      targets.forEach(element => {
        gsap.killTweensOf(element);
        gsap.set(element, { clearProps: "opacity,transform" });
      });
    };
  });
  const refresh = () => ScrollTrigger.refresh();
  document.querySelectorAll("details").forEach(element => element.addEventListener("toggle", refresh));
  if (document.fonts) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
  window.addEventListener("pageshow", refresh);
  if ("ResizeObserver" in window) {
    let frame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    });
    observer.observe(document.querySelector("main"));
  }
})();
