# Security Policy

## Keyflow's privacy & security model

Keyflow is **local-first** and runs entirely in your browser:

- **No backend, no accounts, no servers.** There is nothing to log in to.
- **No telemetry, analytics, ads, or trackers.** Keyflow makes **zero external
  network requests** at runtime — fonts and assets are self-hosted.
- **Your data never leaves your device.** Settings, stats, and typing history are
  stored only in your browser (`localStorage` + `IndexedDB`). You can export or wipe
  your data at any time from within the app.
- A strict **Content-Security-Policy** (`default-src 'self'`) is enforced, and the
  app uses no `eval` or `dangerouslySetInnerHTML`.

Because there is no server and no remote data store, the realistic risk surface is
limited to the client bundle and its dependencies — which we deliberately keep
minimal and monitor with `npm audit` (a CI gate) and Dependabot.

## Supported versions

The latest `main` branch — and the build deployed to GitHub Pages — is the supported
version.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead, use GitHub's
**private vulnerability reporting** on this repository:

> **Security** tab → **Report a vulnerability**

This opens a private channel with the maintainers. You can expect an acknowledgement
within a few days. Once a fix is released, we'll credit you (if you'd like) in the
release notes.

Thank you for helping keep Keyflow safe.
