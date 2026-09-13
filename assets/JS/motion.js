// Content remains visible when GSAP or ScrollTrigger is unavailable.
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add("(prefers-reduced-motion: no-preference)", () => {
    const triggers = [];
    const activeAnimations = new Map();

    function replay(key, build) {
      activeAnimations.get(key)?.kill();
      activeAnimations.set(key, build());
    }

    function observe(trigger, build, start = "top 84%") {
      if (!trigger) return;
      triggers.push(ScrollTrigger.create({
        trigger,
        start,
        end: "bottom top",
        onEnter: () => replay(trigger, build),
        onEnterBack: () => replay(trigger, build),
        invalidateOnRefresh: true
      }));
    }

    const overview = document.querySelector("#overview");
    const about = document.querySelector("#about");
    if (about) {
      const head = about.querySelector(".section-head");
      const content = about.querySelectorAll(".about-copy > *");
      observe(about, () => gsap.timeline()
        .fromTo(head.children, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: .55, stagger: .1, clearProps: "opacity,visibility,transform" })
        .fromTo(content, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .65, stagger: .12, ease: "power2.out", clearProps: "opacity,visibility,transform" }, "-=.3"));
    }

    if (overview) {
      const head = overview.querySelector(".section-head");
      const cards = overview.querySelectorAll(".card");
      observe(overview, () => gsap.timeline()
        .fromTo(head.children, { autoAlpha: 0, y: 12, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .5, stagger: .1, clearProps: "opacity,visibility,transform,filter" })
        .fromTo(cards, { autoAlpha: 0, scale: .94, filter: "blur(8px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .65, stagger: .1, ease: "power2.out", clearProps: "opacity,visibility,transform,filter" }, "-=.25"));
    }

    const projects = document.querySelector("#projects");
    if (projects) {
      const projectHead = projects.querySelector(".section-head");
      observe(projectHead, () => gsap.fromTo(projectHead.children,
        { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .1, clearProps: "opacity,visibility,transform" }));
      projects.querySelectorAll(".project-card").forEach((card, index) => {
        observe(card, () => gsap.fromTo(card,
          { autoAlpha: 0, x: index % 2 ? 52 : -52, scale: .985 },
          { autoAlpha: 1, x: 0, scale: 1, duration: .75, ease: "power3.out", clearProps: "opacity,visibility,transform" }
        ));
      });
    }

    const experience = document.querySelector("#experience");
    if (experience) {
      const head = experience.querySelector(".section-head");
      const timeline = experience.querySelector(".timeline");
      const cards = experience.querySelectorAll(".timeline > .card");
      observe(experience, () => {
        gsap.set(timeline, { "--timeline-progress": 0 });
        gsap.set(cards, { "--marker-scale": 0 });
        return gsap.timeline()
          .fromTo(head.children, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: .5, stagger: .1, clearProps: "opacity,visibility,transform" })
          .to(timeline, { "--timeline-progress": 1, duration: 1.15, ease: "power2.inOut" }, "-=.2")
          .fromTo(cards,
            { autoAlpha: 0, x: 24 },
            { autoAlpha: 1, x: 0, "--marker-scale": 1, duration: .6, stagger: .28, ease: "power2.out", clearProps: "opacity,visibility,transform" },
            "-=.9");
      });
    }

    const skills = document.querySelector("#skills");
    if (skills) {
      const head = skills.querySelector(".section-head");
      const cards = skills.querySelectorAll(".skills-grid .card");
      const strengths = skills.querySelector(".strengths");
      observe(skills, () => gsap.timeline()
        .fromTo(head.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .1, clearProps: "opacity,visibility,transform" })
        .fromTo(cards,
          { autoAlpha: 0, x: index => index % 2 ? 34 : -34 },
          { autoAlpha: 1, x: 0, duration: .65, stagger: .12, ease: "power2.out", clearProps: "opacity,visibility,transform" },
          "-=.2")
        .fromTo(strengths, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, clearProps: "opacity,visibility" }, "-=.2"));
    }

    const contact = document.querySelector("#contact");
    if (contact) {
      const introduction = contact.querySelector(".contact-layout > div");
      const introductionItems = introduction.querySelectorAll(":scope > .eyebrow, :scope > h2, :scope > p:not(.eyebrow)");
      const contactCard = introduction.querySelector(".contact-card");
      const socialLinks = introduction.querySelector(".contact-social-links");
      const form = contact.querySelector(".contact-form");
      observe(contact, () => gsap.timeline()
        .fromTo(introductionItems, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: .5, stagger: .09, ease: "power2.out", clearProps: "opacity,visibility,transform" })
        .fromTo(contactCard, { autoAlpha: 0, x: -32, scale: .98 }, { autoAlpha: 1, x: 0, scale: 1, duration: .6, ease: "power2.out", clearProps: "opacity,visibility,transform" }, "-=.2")
        .fromTo(socialLinks, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: .5, ease: "power2.out", clearProps: "opacity,visibility,transform" }, "-=.35")
        .fromTo(form, { autoAlpha: 0, x: 36, scale: .98 }, { autoAlpha: 1, x: 0, scale: 1, duration: .7, ease: "power2.out", clearProps: "opacity,visibility,transform" }, "-=.8"));
    }

    const footer = document.querySelector(".site-footer");
    observe(footer, () => gsap.fromTo(footer, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, clearProps: "opacity,visibility" }), "top 95%");

    const caseHero = document.querySelector(".case-hero");
    if (caseHero) {
      observe(caseHero, () => gsap.fromTo(caseHero.children,
        { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .12, ease: "power2.out", clearProps: "opacity,visibility,transform" }), "top bottom");
      document.querySelectorAll(".case-study > aside, .case-study article > section").forEach(element => {
        observe(element, () => gsap.fromTo(element,
          { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .65, ease: "power2.out", clearProps: "opacity,visibility,transform" }));
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    document.querySelectorAll("details").forEach(element => element.addEventListener("toggle", refresh));
    if (document.fonts) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    window.addEventListener("pageshow", refresh);

    return () => {
      triggers.forEach(trigger => trigger.kill());
      activeAnimations.forEach(animation => animation.kill());
      gsap.set(
        ".hero-copy > *, .portrait, .section-head > *, .about-copy > *, #overview .card, .project-card, .project-cover, .project-body > *, .timeline, .timeline > .card, #skills .card, .strengths, .contact-layout > div > .eyebrow, .contact-layout > div > h2, .contact-layout > div > p, .contact-card, .contact-social-links, .contact-form, .site-footer, .case-hero > *, .case-study > aside, .case-study article > section",
        { clearProps: "opacity,visibility,transform,filter,clipPath,--timeline-progress,--marker-scale" }
      );
    };
  });
})();
