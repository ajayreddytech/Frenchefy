<div align="center">

# Frenchefy

**A calm, responsive French-study journal for building a consistent daily learning habit.**

Track study time, review a calendar of sessions, and understand your progress toward a 900-hour goal. Your study records stay in your browser.

[Open Frenchefy](https://frenchefy.netlify.app/) · [Privacy Policy](https://frenchefy.netlify.app/privacy) · [Terms of Service](https://frenchefy.netlify.app/terms)

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

## Live app

Frenchefy is available as a web app at [frenchefy.netlify.app](https://frenchefy.netlify.app/). No native Android or iOS app is currently published.

## Features

- **Study log:** Save a date and duration in hours or minutes; minutes are converted to hours.
- **Daily goal:** Configure a daily target and view current progress.
- **History calendar:** Browse monthly records, add sessions, edit a day's total, or delete a day's record.
- **Insights:** Review total hours, calendar-day averages, streaks, day/week/month/year charts with a quick dropdown for the current day, week, month, or year, weekly and monthly goal progress, and a candid estimate toward 900 hours.
- **Light and dark themes:** Choose a palette suited to your preference.
- **Daily reminder:** See a rotating language-learning encouragement.
- **Settings and support:** View app version, contact support, open the open-source license list, and optionally support development.
- **Local persistence:** Without cloud configuration, entries and preferences stay in this browser.
- **Optional Google sign-in and cloud sync:** When Supabase is configured, study entries, daily goals, and theme preferences sync to the signed-in account. Existing local study entries are imported on first sign-in, combining hours on matching dates.
- **Responsive interface:** Layout adapts to mobile, tablet, and desktop browser widths.

## Technology & Architecture

| Area | Implementation |
|---|---|
| UI | React 18, Vite 6 |
| Styling | Hand-authored CSS, Tailwind CSS configuration |
| Icons | Lucide React |
| State | React hooks (`useState`, `useEffect`, `useMemo`) |
| Persistence | Browser `localStorage`; optional Supabase PostgreSQL per-account cloud sync |
| Networking | Optional Supabase Auth and database; no custom application server |
| Native platforms | No Android/iOS wrapper or native project is included |
| CI/CD | Not configured in this repository |
| Tests / static analysis | No test runner or lint script is currently configured; `npm run build` is the available release check |

### Data flow

`src/App.jsx` owns the study entries, preferences, date navigation, and derived analytics. It stores data locally and, when configured, syncs entries and preferences to the signed-in Supabase account. `src/supabase.js` initializes the optional Supabase client. `src/SettingsView.jsx` contains account, settings, legal, support, and licenses UI. `supabase/schema.sql` defines the cloud tables and per-user row-level security policies. `src/index.css` contains theme and responsive styles.

Without Supabase configuration, data stays in browser `localStorage` and is not synchronized. With Supabase configured, study entries, daily goal, and theme are stored in the account's cloud tables; the browser also keeps a local cache. Clearing browser/site data removes that cache but does not delete cloud records. Do not use the app to store sensitive information.

## Project Structure

```text
.
├── public/
│   ├── favicon.svg
│   ├── privacy.html
│   └── terms.html
├── src/
│   ├── App.jsx             # App state, logging, history, insights, and navigation
│   ├── supabase.js         # Optional Supabase client
│   ├── SettingsView.jsx    # Settings, support links, and license modal
│   ├── index.css           # Themes, layout, and responsive styles
│   └── main.jsx            # React entry point
├── supabase/
│   └── schema.sql          # Cloud tables and row-level security policies
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .env.example            # Optional public link configuration
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── netlify.toml            # Netlify build, publish, and SPA fallback settings
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
git clone https://github.com/ajayreddytech/Frenchify.git
cd Frenchify
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
| `VITE_LEGAL_DOMAIN` | Hostname serving `/privacy` and `/terms`; defaults to `frenchefy.netlify.app` |
| `VITE_KOFI_URL` | Public Ko-fi page URL |

Vite exposes `VITE_` values to the client bundle. Use these variables only for public URLs—**never put passwords, private tokens, signing keys, or other secrets in them**. Restart the dev server after changing `.env`.

### Enable Google sign-in and cloud sync

Cloud sync is optional. Without it, the app continues to save data in the current browser. To enable accounts and cloud storage:

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). It creates the study-entry and account-preference tables and enables row-level security so each signed-in user can access only their own rows.
3. In Supabase Authentication settings, enable the Google provider. Create/configure a Google OAuth client using the callback URL shown by Supabase.
4. Add your local and deployed app URLs to Supabase's allowed redirect URLs (for example `http://localhost:5173/**` and your Netlify site URL). Set the Supabase site URL to the deployed site.
5. Copy the project URL and public anon/publishable key into `.env`:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
   ```

   These are browser-visible public configuration values. **Never use or publish a Supabase `service_role` key.**
6. For Netlify, set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in the site's environment-variable settings, then deploy again. The Netlify URL must also be on Supabase's allowed redirect list.
7. Test Google sign-in and sign-out on both localhost and the deployed HTTPS site. First sign-in imports existing local study entries and adds hours for dates already present in the account.

New users are created automatically by Google OAuth on their first sign-in. Changes sync while the app is open; reopen the app on another device to fetch the latest cloud data. Live cross-device updates are not currently enabled. Each browser keeps a local cache as well.

### Production build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`. Deploy that directory to a static web host with HTTPS and SPA fallback behavior configured as appropriate for your host.

### Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site** → **Import an existing project**, then connect your GitHub repository.
3. Leave the build settings as detected from `netlify.toml` (`npm run build`, publish directory `dist`) and deploy.

The Netlify configuration serves the static privacy and terms pages at `/privacy` and `/terms`, and provides a single-page-app fallback for app routes. To set optional public links for a Netlify deployment, add the corresponding `VITE_` variables under **Site configuration** → **Environment variables**, then trigger a new deploy. Do not add secrets to `VITE_` variables.

## Production readiness

- Review the published [Privacy Policy](https://frenchefy.netlify.app/privacy) and [Terms of Service](https://frenchefy.netlify.app/terms) against the final hosting, data-retention, and account-deletion practices before launch or material changes.
- Configure and test OAuth redirect URLs for localhost and the final HTTPS domain.
- Test account isolation and row-level security with at least two separate test accounts; verify read, create, edit, and delete behavior.
- Add a user-facing data export and account/data deletion flow, including deletion from Supabase.
- Decide on backup/restore, outage response, and a migration plan; review the provider's current free-tier quotas and pricing because free plans and limits can change.
- Add automated tests for login, local-data import, sync failures/retries, account switching, and data access rules; run them in CI for every pull request.
- Verify accessibility, mobile layouts, browser support, error states, and a production build on the deployed Netlify site.
- Set up a custom domain, HTTPS, support contact, dependency/security update process, and basic uptime/error monitoring.

## Testing & Quality Assurance

No automated test runner, linter, or type checker is configured yet. The current build check is:

```bash
npm run build
```

Before a release, also manually verify logging/editing/deleting sessions, browser persistence, light/dark mode, keyboard-accessible controls, and responsive layouts. Add automated tests and CI before describing them as available.

## Legal & Contact

- **Live app:** [frenchefy.netlify.app](https://frenchefy.netlify.app/)
- **Privacy policy:** [frenchefy.netlify.app/privacy](https://frenchefy.netlify.app/privacy)
- **Terms of service:** [frenchefy.netlify.app/terms](https://frenchefy.netlify.app/terms)
- **License:** This repository is distributed under the [MIT License](./LICENSE).
- **Support:** [Email Ajay Kumar Reddy](mailto:ajayreddy.tech@gmail.com?subject=App%20Support%20Request%20-%20Frenchefy)
- **Developer support:** [Ko-fi](https://ko-fi.com/ajayreddytech) is voluntary and does not unlock app features.

> This project has not been reviewed or certified as compliant with Google Play or Apple App Store policies. Store requirements depend on the final app package, data practices, disclosures, age/content ratings, and current platform policies. Complete those reviews before submitting.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and use the issue and pull-request templates.
