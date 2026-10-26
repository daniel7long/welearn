# WeLearn LMS (mobile-first demo)

React + TypeScript + Vite. English UI, sign up / log in, and a private Hub for every account.

## Run locally (PowerShell)

```powershell
cd welearn-lms
npm install
npm run dev
```

Open **http://localhost:5827** (Vite also prints a Network URL you can open on your phone).

The port is set once in `vite.config.ts` (`const PORT = 5827`). `strictPort` is on, so if something
else already uses it Vite stops with an error instead of silently switching ports. Change the number if needed.

## Deploy to Vercel
Import the Git repo; framework preset **Vite**, build `npm run build`, output `dist`.
`vercel.json` rewrites all paths to `index.html` so deep links work.

## How the demo works
- No server. Accounts and per-user data live in the browser's localStorage (passwords are salted + hashed,
  but this is demo auth, not production auth). Each account gets its own hub, check-ins, posts and points.
- Classmates, the leaderboard and teacher feedback are sample content generated in `src/lib/`.
- `npm run typecheck` runs the TypeScript check. (`build` doesn't gate on it, so a type nit can't block a deploy.)

## Structure
- `src/lib/store.ts` – auth + per-user data (swap this file for a real API later)
- `src/lib/curriculum.ts` – daily tasks, class schedule, sample feedback
- `src/lib/router.tsx` – tiny built-in router (no dependency)
- `src/pages/*` – screens; `src/components/*` – shared UI
