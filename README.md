# Le Dang Toan Thang — Portfolio

Static HTML/CSS/JavaScript portfolio inspired by the layout at http://hungle.me/MyPortfolio/.
The implementation uses original local styles and the owner's CV content.

## Structure

- `index.html`: profile, three featured projects, internship experience, skills and contact.
- `projects/`: standalone case-study pages for each featured project.
- `assets/CSS/personalStyle.css`: theme tokens, layout, components and responsive rules.
- `assets/JS/theme.js`: saved/system theme applied before rendering.
- `assets/JS/portfolio.js`: mobile navigation, theme switch, copy email and active section.
- `assets/JS/motion.js`: GSAP + ScrollTrigger reveals and layout refresh handling.
- `assets/IMG/`: existing portrait and university logo.

## Preview

Run `python -m http.server 8000 --bind 127.0.0.1` from this directory, then open
http://127.0.0.1:8000. No build or package installation is required.

Project contributions, dates and technical skills come from the supplied CV.
Featured project cards show only timeline, team, core stack and external links.
Clicking a card opens its detailed case-study page.
Internship experience contains Rockship; education appears in the overview.
Native details panels work without JavaScript.
Social buttons in the hero open GitHub, LinkedIn, Facebook and Zalo.
The contact form posts email and message fields to FormSubmit for forwarding to
`ledangtoanthang3008@gmail.com`. Browser validation and the default CAPTCHA remain enabled.
The first submission triggers an activation email: confirm it in the recipient's inbox
(check Spam too) before using mail delivery. Serve the site over HTTP/HTTPS, submit once,
activate the email address, then send another message and confirm receipt.
Submissions continue on FormSubmit's verification/confirmation page.
Delivery has not been tested from this workspace; no test email was sent.
Clicking the email address or phone number copies its value to the clipboard.
Clipboard access requires HTTPS or localhost; failures show a manual-copy message.
Google Fonts is optional; system font fallbacks are defined.

## Motion

GSAP + ScrollTrigger 3.12.5 load from jsDelivr. Native scrolling is preserved.
Each element animates on enter and enter-back without storing a hidden off-screen state.
Hero content and cards animate independently with staggered delays.
The contact form reveals only once. Keyboard focus makes its target visible immediately.
Reduced-motion preferences disable visual animation immediately, including live changes.
Content and the contact form remain usable if the animation CDN is unavailable.
Check desktop/mobile scrolling, expanded project details, keyboard navigation and
the operating system's reduced-motion setting when previewing.
