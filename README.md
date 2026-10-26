<div align="center">

<img src="public/favicon.svg" alt="WeLearn logo" width="72" height="72" />

# WeLearn LMS

**A mobile-first learning management system for daily practice, live classes and learner community.**

English edition of the WeLearn LMS, a platform used by more than 23,000 learners in its original Chinese release.

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Deploy](https://img.shields.io/badge/deploy-Vercel%20%7C%20Render-000000)

</div>

---

## Overview

WeLearn helps students build a consistent study habit and stay connected to their teachers and classmates. Each learner has a private **Hub** that brings together today's practice tasks, upcoming classes, teacher feedback, points and class standing, all designed for one-handed use on a phone.

This repository is the English, mobile-first rebuild of the product. It keeps the core learning loop from the original app and removes screens that distracted from it (such as the rewards catalogue and referral campaign).

## Features

| Area | What learners can do |
| --- | --- |
| **Accounts** | Sign up and log in with email and password. Every account has its own isolated Hub. |
| **Daily check-ins** | Complete assigned practice tasks with text, up to three photos, or a recorded voice note. |
| **Make-ups** | Catch up on missed tasks. Make-ups within 3 days earn full points; later ones still count toward streaks and rank but earn none. |
| **Classes** | Monthly calendar, per-day class timeline, one-tap class sign-in, and course-hour progress. |
| **Teacher feedback** | Per-class homework review, topics covered, in-class performance and the next assignment. |
| **Community** | Class feed with likes and threaded replies (140-character limit), plus weekly and last-week leaderboards. |
| **Progress** | Points, levels, day streak, full check-in history and learning records. |

### Navigation

Four tabs keep everything within one tap:

```
Today        Schedule        Community        Me
 ├ week strip   ├ course progress  ├ Feed             ├ Level, points, streak
 ├ check-ins    ├ month calendar   └ Leaderboard      ├ My check-ins
 └ classes      └ day timeline                         ├ Learning records
                                                       └ About WeLearn
```

## Tech stack

- **React 19** and **TypeScript** (strict mode)
- **Vite 5** for development and production builds
- Plain CSS with design tokens (no UI framework)
- A small History-API router and inline SVG icons, so the runtime has **no dependencies beyond React**

## Getting started

**Requirements:** Node.js 20 or newer.

```powershell
git clone https://github.com/<your-username>/welearn-lms.git
cd welearn-lms
npm install
npm run dev
```

The app is served at **http://localhost:5827** (Vite also prints a Network URL for testing on a phone).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |

### Configuration

The development and preview port is defined once in `vite.config.ts`:

```ts
const PORT = 5827
```

`strictPort` is enabled, so if the port is already in use Vite exits with an error instead of silently switching ports. This keeps WeLearn from colliding with other projects running on the same machine.

## Deployment

The app builds to static files and needs no server process.

### Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Keep the detected **Vite** preset: build command `npm run build`, output directory `dist`.
3. Deploy. `vercel.json` rewrites every path to `index.html`, so deep links and page refreshes work.

### Render (Static Site)

1. Create a **Static Site** from the repository.
2. Build command: `npm install && npm run build`. Publish directory: `dist`.
3. Add a rewrite rule: source `/*`, destination `/index.html`, action **Rewrite**.

Both platforms redeploy automatically on every push to `main` and serve over HTTPS, which browsers require for microphone access (voice notes).

## Data layer

All reads and writes go through a single module, **`src/lib/store.ts`**. In this release it persists to the browser's `localStorage`, scoped per account, so the app runs end to end without any server. Passwords are salted and hashed with SHA-256, which is suitable for prototyping but not for production authentication.

Because the UI only talks to the store's exported functions (`signUp`, `logIn`, `checkIn`, `toggleLike`, `addComment`, and so on), moving to a real backend means replacing that one file with API calls. No screen needs to change.

Classmates, leaderboard standings and teacher feedback are currently generated sample content (`src/lib/classmates.ts`, `src/lib/curriculum.ts`).

### Before a production launch

- Replace local storage with an API and database, and move authentication server-side (hashed passwords with a slow KDF, sessions or tokens, email verification, password reset).
- Store photos and voice notes in object storage instead of inline data URLs.
- Source the class schedule, tasks and teacher feedback from the teacher and admin tooling.
- Add moderation and reporting for community posts and comments.

## Project structure

```
src/
├─ App.tsx              Route table and auth guard
├─ main.tsx             Entry point
├─ styles.css           Design tokens and component styles
├─ components/
│  ├─ Icon.tsx          Inline SVG icons and logo
│  └─ ui.tsx            Avatar, header, tab bar, post card, shared UI
├─ lib/
│  ├─ store.ts          Auth and per-user data (swap for an API)
│  ├─ curriculum.ts     Daily tasks, class schedule, feedback content
│  ├─ classmates.ts     Sample classmates and seed posts
│  ├─ media.ts          Photo downscaling and voice recording
│  ├─ dates.ts          Date helpers (weeks start on Monday)
│  └─ router.tsx        Minimal router
└─ pages/               Auth, Today, Schedule, Community, PostDetail,
                        CheckIn, ClassFeedback, Me (+ records, about)
```

## Design principles

- **Mobile first.** Designed at phone width, centred in a phone-width column on larger screens.
- **One clear next action.** Each screen leads with what the learner should do now.
- **Accessible by default.** Visible focus states, labelled controls, 16px form inputs and support for reduced motion.

## About WeLearn

WeLearn Education was founded by teachers with more than a decade of experience in international education. Its mission is to help students aged 9 to 18 improve their English, academic performance and overall skills through professional teaching and technology.

Website: [www.hao-edu.cn](https://www.hao-edu.cn)
