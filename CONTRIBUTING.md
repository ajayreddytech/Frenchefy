# Contributing

Thank you for considering a contribution to Frenchify.

## Before you start

- Search existing issues and pull requests to avoid duplicating work.
- For a significant change, open an issue first to discuss the approach.
- Keep changes focused and preserve the app's local-first behavior unless a proposal explicitly changes it.
- Never commit secrets, private user study records, or real `.env` files.

## Development setup

Requirements: Node.js 20 LTS (recommended) and npm.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` only if you need to test public links. The `VITE_` variables are bundled into client code and must never contain secrets.

## Quality checks

Run the available production check before submitting:

```bash
npm run build
```

There is no configured test runner, lint command, or type checker at this time. Do not report those checks as passing unless they have been added and run. For UI changes, manually check keyboard access, theme compatibility, and responsive layouts.

## Pull requests

- Use a clear, concise title. Conventional Commit prefixes are encouraged (for example, `fix(history): toggle calendar selection`).
- Explain the user-facing impact and implementation approach.
- Link related issues.
- Include screenshots for visual changes when practical.
- Keep unrelated formatting or generated build output out of the pull request.
- Update documentation when behavior or setup changes.

## Reporting issues

Use the provided bug-report and feature-request templates. Do not post passwords, access tokens, or private study history.
