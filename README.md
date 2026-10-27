# WeLearn — Learning Management App

> A mobile-first learning management experience, rebuilt in English.

[![Live demo](https://img.shields.io/badge/Live%20demo-welearn--lac.vercel.app-0E8FA3?style=for-the-badge)](https://welearn-lac.vercel.app)

WeLearn is a learning management system (LMS) designed for phones first. Every learner signs up, logs in and gets their **own hub**: a personal dashboard that keeps their learning in one place.

This project is an English rebuild of the WeLearn LMS, whose original edition serves **more than 23,000 users**. The existing interface was studied screen by screen and reconstructed as a clean, product-grade web app.

<!-- Add 3–4 screenshots here, e.g.:
<p align="center"><img src="docs/screenshots/login.png" width="22%"> <img src="docs/screenshots/hub.png" width="22%"> <img src="docs/screenshots/course.png" width="22%"></p>
-->

| | |
| --- | --- |
| **Live demo** | <https://welearn-lac.vercel.app> |
| **Type** | Mobile-first web app (LMS) |
| **Original product** | 23,000+ users |

---

## Key features

- **Sign up and log in** with a personal account.
- **Personal hub / dashboard:** each learner lands on their own space instead of a generic home page.
- **Mobile-first layouts,** designed for small screens first.
- **Fully English interface,** with copy and labels written for English-speaking learners.

## Design and UX highlights

- **Clarity over feature parity.** The goal was not to copy every screen. Screens such as reward listings were open to being simplified or cut so the app stays clean and intuitive.
- **Teal identity** (`#0E8FA3`) carried through the browser theme colour and the interface.
- **Rebuilt from screens alone.** No UI source code was available, so the information architecture, component patterns and flows were reconstructed from the existing interface, then redesigned.
- **Safe-area aware layout** (`viewport-fit=cover`) for modern phones.

## Tech stack

| Layer | Technology |
| --- | --- |
| Front end | Responsive, mobile-first web app |
| Hosting | **Vercel**, deployed from Git |
| Source control | **Git / GitHub** |

<!-- TODO(stack): add the framework, language, auth approach and back-end/data layer (check package.json). -->

## Engineering highlights

- **Git-to-production workflow.** The project is deployed from Git to Vercel, so the live demo can be updated with a push.
- **Product-grade scope.** Built as the English counterpart of a product with a large existing user base, not as a throwaway demo.

---

**Designed and built by [Daniel Long](https://daniel7long.com)** · M.S. Human-Computer Interaction, Carnegie Mellon University
