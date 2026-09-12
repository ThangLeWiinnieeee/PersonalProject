# Le Dang Toan Thang — Portfolio

Static HTML/CSS/JavaScript portfolio inspired by the layout at http://hungle.me/MyPortfolio/.
The implementation uses original local styles and the owner's CV content.

## Structure

- `index.html`: profile, three featured projects, internship experience, skills and contact.
- `assets/CSS/personalStyle.css`: theme tokens, layout, components and responsive rules.
- `assets/JS/theme.js`: saved/system theme applied before rendering.
- `assets/JS/portfolio.js`: mobile navigation, theme switch, copy email and active section.
- `assets/IMG/`: existing portrait and university logo.

## Preview

Run `python -m http.server 8000 --bind 127.0.0.1` from this directory, then open
http://127.0.0.1:8000. No build or package installation is required.

Project contributions, dates and technical skills come from the supplied CV.
Featured projects include the two web platforms and Pharmacy Management System.
Internship experience contains Rockship; education appears in the overview.
Native details panels work without JavaScript.
Contact links open the visitor's email/phone app; no messages are submitted to a third-party service.
Google Fonts is optional; system font fallbacks are defined.
