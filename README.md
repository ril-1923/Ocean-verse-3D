# OceanVerse 3D
Discover the Hidden Wonders of Our Ocean. React 18 + TypeScript + Vite + React Three Fiber + Drei + Bootstrap 5 + Recharts + Zustand (HashRouter, no backend).

All data (species status, analytics, station status, reef/deep readings) is **simulated demonstration data**, not live or verified scientific measurements.

## Run
`npm install` → `npm run dev` | `npm run build` | `npm run preview`

## Deploy to GitHub Pages
`vite.config.ts` uses `base: './'` and the app uses HashRouter. Push to `main` with Pages source set to "GitHub Actions" (workflow in `.github/workflows/deploy.yml`), or upload `dist/`.

## Features
Dashboard, 3D Explorer (camera presets, live environment controls, clickable animals/corals), Marine Life catalogue (search/filter/favorites/modal), Coral Reef (stress slider), Deep Ocean (depth presets, WASD/Q/E ROV), Research Station, Analytics (filters), Missions (driven by real interactions), Settings (theme, motion, export, resets). Progress persists in LocalStorage.
