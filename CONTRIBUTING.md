# Contributing to Keyflow

Thanks for your interest! Keyflow is a local-first typing trainer built with
**Vite + React + TypeScript + Tailwind**. This guide gets you set up.

## Prerequisites

- [Node.js](https://nodejs.org/) **20 or newer** (we develop on Node 24 LTS)

## Setup

```bash
git clone https://github.com/JDJ760/keyflow.git
cd keyflow
npm install
npm run dev
```

## Useful scripts

- `npm run dev` — start the dev server with HMR
- `npm run build` — type-check and produce a production build in `dist/`
- `npm run test` / `npm run test:run` — unit tests (Vitest)
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run typecheck` — full project type-check

Before opening a pull request, please run:

```bash
npm run lint && npm run typecheck && npm run test:run
```

## Project principles

These are the constraints that make Keyflow what it is — please keep them intact:

1. **Local-first, always.** No network calls at runtime, no telemetry, no analytics.
   Do not add external CDN/asset dependencies — self-host everything.
2. **Privacy by default.** User data stays in the browser. Anything stored must be
   exportable and wipeable by the user.
3. **Minimal dependencies.** Each new runtime dependency is a supply-chain liability.
   Prefer the platform; discuss before adding one.
4. **Type-safe & tested.** TypeScript is strict; avoid `any`. The typing engine
   (metrics, adaptive logic) should have unit tests.
5. **Accessible & themeable.** Respect `prefers-reduced-motion`, keep good color
   contrast, and use semantic theme tokens rather than hard-coded colors.

## Commits & PRs

- Use clear, descriptive commit messages.
- Keep pull requests small and focused.
- Describe the user-facing change and how you verified it.

Happy typing! ⌨️
