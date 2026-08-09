# ⌨️ Keyflow

**A local-first, game-like typing trainer that helps you build real speed and accuracy — and shows you exactly which keys are holding you back.**

[![CI](https://github.com/JDJ760/keyflow/actions/workflows/ci.yml/badge.svg)](https://github.com/JDJ760/keyflow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-e2b714.svg)](LICENSE)
![Local-first](https://img.shields.io/badge/local--first-no%20tracking-7ee787)
![React 19 + TypeScript](https://img.shields.io/badge/React%2019-TypeScript-161b22)

> 🔒 **100% local & private.** No accounts, no servers, no telemetry, no ads. Keyflow makes **zero external network requests** at runtime — your settings, stats, and full typing history live only in your browser. You can export them as a file or wipe them at any time.

---

## Why Keyflow?

Most typing tools are either dated desktop tutors or polished web apps that route your
data through someone else's servers. Keyflow is built around three ideas:

- **Get better, measurably.** It tracks every keystroke to find your weakest keys and
  generates drills that target exactly those — the fastest path to real improvement.
- **See your progress.** Rich history charts, a practice calendar, and per-key
  breakdowns turn practice into visible momentum.
- **Stay yours.** It's a static, offline-capable web app. Nothing leaves your device.

## ✨ Features

### Available now

- **Progression** — XP & levels, daily streaks, 13 achievements, and a seeded **daily challenge**
- **Adaptive coach** — per-key speed & accuracy analytics, a live keyboard heatmap, and
  one-click **targeted drills** built from your weakest letters
- **Five themes** — Liquid Flow, Aurora Glass, Pressroom, Overdrive, and Daylight — switchable live
- **Stats dashboard** — WPM-over-time chart, practice-calendar heatmap, personal bests, and JSON export/import
- **Core typing test** — `time`, `words`, `quote`, and `zen` modes with live WPM,
  accuracy, and consistency, character-by-character feedback, and a smooth droplet caret
- **Results screen** — raw WPM, consistency, time, character breakdown, and personal bests
- The signature **Liquid Flow** theme (plus a light theme) on a token-based theme system
- Framework-free typing engine with **42 unit tests**; strict React 19 + TypeScript + Tailwind v4
- Local-first architecture with a hardened security baseline (strict CSP, zero trackers)

### Coming next (see the [Roadmap](#-roadmap))

- Progression (XP, streaks, achievements, daily challenge), arcade modes (Falling Words,
  race-your-ghost), and a desktop build
- Backlog and review notes live in [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md)

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **20 or newer** (developed on Node 24 LTS)

### Run it locally

```bash
git clone https://github.com/JDJ760/keyflow.git
cd keyflow
npm install
npm run dev
```

Then open the local URL Vite prints (default <http://localhost:5173>).

### Build for production

```bash
npm run build     # type-checks, then builds to dist/
npm run preview   # serve the production build locally
```

## 🧰 Scripts

| Script                  | What it does                               |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start the Vite dev server with HMR         |
| `npm run build`         | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview`       | Preview the production build               |
| `npm run test`          | Run unit tests in watch mode (Vitest)      |
| `npm run test:run`      | Run unit tests once                        |
| `npm run test:coverage` | Run tests with a coverage report           |
| `npm run lint`          | Lint with ESLint                           |
| `npm run format`        | Format with Prettier                       |
| `npm run typecheck`     | Type-check the whole project               |

## 🗂️ Project structure

```
keyflow/
├─ public/                 # static assets (self-hosted, no CDNs)
├─ src/
│  ├─ engine/              # framework-free typing engine (metrics, session, generator, adaptive)
│  ├─ components/          # UI building blocks (typing area, caret, keyboard heatmap, charts…)
│  ├─ views/               # top-level screens (Test, Stats, Coach, Settings)
│  ├─ store/               # Zustand state + persistence
│  ├─ storage/             # IndexedDB / localStorage wrappers, export/import
│  ├─ theme/               # design tokens & theme switching
│  ├─ data/                # openly-licensed word & quote lists, keyboard layouts
│  ├─ App.tsx
│  ├─ index.css            # Tailwind + theme tokens
│  └─ main.tsx
├─ index.html              # strict Content-Security-Policy lives here
└─ vite.config.ts
```

> The `engine/`, `views/`, and `store/` folders fill in as the phases land — see the roadmap.

## 🔐 Security & privacy

Keyflow is designed to have essentially no attack surface:

- **No backend, no accounts, no network calls at runtime.** Fonts and assets are self-hosted.
- **Strict Content-Security-Policy** (`default-src 'self'`); no `eval`, no `dangerouslySetInnerHTML`.
- **Your data is yours** — stored only in `localStorage` + `IndexedDB`, with built-in export & wipe.
- **Minimal, monitored dependencies** — lockfile committed, `npm audit` gate in CI, Dependabot updates.

See [SECURITY.md](SECURITY.md) for the full policy and how to report a vulnerability.

## 🧭 Roadmap

| Phase | Focus                                                                    | Status  |
| ----- | ------------------------------------------------------------------------ | ------- |
| 0     | Foundations — tooling, security baseline, CI/CD, docs                    | ✅ Done |
| 1     | Core typing engine + clean UI (timed / words / quote / zen, live stats)  | ✅ Done |
| 2     | Rich stats & themes (history charts, practice calendar, export/import)   | ✅ Done |
| 3     | Adaptive coaching (per-key analytics, keyboard heatmap, targeted drills) | ✅ Done |
| 4     | Progression & rewards (XP, streaks, achievements, daily challenge)       | ✅ Done |
| 5     | Arcade modes (Falling Words, race-your-ghost, survival)                  | 🔜 Next |
| 6     | Desktop app (Tauri) + full accessibility pass                            | Later   |

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and conventions.

## 📜 License

[MIT](LICENSE) © 2026 Keyflow contributors. Inspired by — but not derived from — the
open-source typing community (Monkeytype, Keybr). Word and quote lists are sourced from
public-domain / openly-licensed material.
