<div align="center">

# The Canadian Dream

**A calm, responsive French-study journal for building a consistent daily learning habit.**

Track study time, review a calendar of sessions, and understand your progress toward a 900-hour goal. Your study records stay in your browser.

![Build](https://img.shields.io/badge/build-verified%20with%20Vite-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-responsive%20web-lightgrey)
![Mobile](https://img.shields.io/badge/Android%20%7C%20iOS-native%20release%20not%20configured-orange)
![Version](https://img.shields.io/badge/version-1.0.0-informational)

[Features](#features) · [Architecture](#technology--architecture) · [Setup](#getting-started) · [Support](#legal--contact)

</div>

> **Release status:** This repository contains a responsive web application built with Vite and React. It does not currently include a native Android or iOS project, store listing, or CI workflow. The mobile platform badge describes the current release status—not a published native app.

## Screenshots

Replace these placeholders with screenshots captured from the current application before publishing:

| Log | History |
|:---:|:---:|
| *Add `docs/screenshots/log.png`* | *Add `docs/screenshots/history.png`* |

| Insights | Settings |
|:---:|:---:|
| *Add `docs/screenshots/insights.png`* | *Add `docs/screenshots/settings.png`* |

## Download

Store links are placeholders and are **not live**. Replace them only after the corresponding store listings have been approved and published.

| Google Play | Apple App Store |
|:---:|:---:|
| <a href="https://play.google.com/store/apps/details?id=com.yourdomain.appname"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="190" alt="Get it on Google Play (placeholder listing)" /></a> | <a href="https://apps.apple.com/app/id0000000000"><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" width="160" alt="Download on the App Store (placeholder listing)" /></a> |

## Features

- **Study log:** Save a date and duration in hours or minutes; minutes are converted to hours.
- **Daily goal:** Configure a daily target and view current progress.
- **History calendar:** Browse monthly records, add sessions, edit a day's total, or delete a day's record.
- **Insights:** Review total hours, calendar-day averages, streaks, day/week/month/year charts, weekly and monthly goal progress, and a candid estimate toward 900 hours.
- **Light and dark themes:** Choose a palette suited to your preference.
- **Daily reminder:** See a rotating language-learning encouragement.
- **Settings and support:** View app version, contact support, open the open-source license list, and optionally support development.
- **Local-first persistence:** Entries and preferences are stored in browser `localStorage`; this project has no backend or account system.
- **Responsive interface:** Layout adapts to mobile, tablet, and desktop browser widths.

## Technology & Architecture

| Area | Implementation |
|---|---|
| UI | React 18, Vite 6 |
| Styling | Hand-authored CSS, Tailwind CSS configuration |
| Icons | Lucide React |
| State | React hooks (`useState`, `useEffect`, `useMemo`) |
| Persistence | Browser `localStorage` |
| Networking | No application API or backend configured |
| Native platforms | No Android/iOS wrapper or native project is included |
| CI/CD | Not configured in this repository |
| Tests / static analysis | No test runner or lint script is currently configured; `npm run build` is the available release check |

### Data flow

`src/App.jsx` owns the study entries, preferences, date navigation, and derived analytics. It persists entries and preferences to `localStorage`, and renders the active navigation view. `src/SettingsView.jsx` contains the settings, legal, support, and licenses UI. `src/index.css` contains theme and responsive styles.

All stored study data is browser-local and is not encrypted or synchronized. Clearing browser/site data can remove it. Do not use the app to store sensitive information.

## Project Structure

```text
.
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx             # App state, logging, history, insights, and navigation
│   ├── SettingsView.jsx    # Settings, support links, and license modal
│   ├── index.css           # Themes, layout, and responsive styles
│   └── main.jsx            # React entry point
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .env.example            # Optional public link configuration
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── package.json
├── postcss.config.js
├── SECURITY.md
├── setup_git_history.sh
├── tailwind.config.js
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 20 LTS (or a Node.js version supported by Vite 6)
- npm (included with Node.js)

**JDK, Android SDK, Yarn, Flutter, and React Native tooling are not required for this web project.** They will be needed only if a native application wrapper is added separately.

### Install and run

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/the-canadian-dream.git
cd the-canadian-dream
npm ci
copy .env.example .env
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

For macOS/Linux, use `cp .env.example .env` instead of `copy`.

### Optional public links

Copy `.env.example` to `.env` and set the public URLs used by Settings:

| Variable | Purpose |
|---|---|
| `VITE_LEGAL_DOMAIN` | Domain serving `/privacy` and `/terms`, without a protocol or trailing slash |
| `VITE_KOFI_URL` | Public Ko-fi page URL |
| `VITE_PAYPAL_ME_URL` | Optional PayPal.me URL |
| `VITE_GITHUB_SPONSORS_URL` | Optional GitHub Sponsors URL |

Vite exposes `VITE_` values to the client bundle. Use these variables only for public URLs—**never put passwords, private tokens, signing keys, or other secrets in them**. Restart the dev server after changing `.env`.

### Production build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`. Deploy that directory to a static web host with HTTPS and SPA fallback behavior configured as appropriate for your host.

## Testing & Quality Assurance

No automated test runner, linter, or type checker is configured yet. The current build check is:

```bash
npm run build
```

Before a release, also manually verify logging/editing/deleting sessions, browser persistence, light/dark mode, keyboard-accessible controls, and responsive layouts. Add automated tests and CI before describing them as available.

## Legal & Contact

- **Privacy policy:** Not yet configured. Set `VITE_LEGAL_DOMAIN` to a domain that serves a public `/privacy` page before collecting or distributing user data.
- **Terms of service:** Not yet configured. Set `VITE_LEGAL_DOMAIN` to a domain that serves a public `/terms` page if terms are required for your release.
- **License:** This repository is distributed under the [MIT License](./LICENSE).
- **Support:** [Email Ajay Kumar Reddy](mailto:ajayreddy.tech@gmail.com?subject=App%20Support%20Request%20-%20The%20Canadian%20Dream)
- **Developer support:** [Ko-fi](https://ko-fi.com/ajayreddytech) is voluntary and does not unlock app features.

> This project has not been reviewed or certified as compliant with Google Play or Apple App Store policies. Store requirements depend on the final app package, data practices, disclosures, age/content ratings, and current platform policies. Complete those reviews before submitting.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and use the issue and pull-request templates.
