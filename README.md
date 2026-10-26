<div align="center">

# Frenchéfy

**A calm, responsive French-study journal for building a consistent daily learning habit.**

Track study time, review a calendar of sessions, and understand your progress toward a 900-hour goal. Your study records stay in your browser.

[Open Frenchéfy](https://frenchefy.netlify.app/) · [Privacy Policy](https://frenchefy.netlify.app/privacy) · [Terms of Service](https://frenchefy.netlify.app/terms)

![Build](https://img.shields.io/badge/build-verified%20with%20Vite-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-responsive%20web-lightgrey)
![Mobile](https://img.shields.io/badge/Android%20%7C%20iOS-native%20release%20not%20configured-orange)
![Version](https://img.shields.io/badge/version-1.0.0-informational)

[Features](#features) · [Architecture](#technology--architecture) · [Setup](#getting-started) · [Support](#legal--contact)

</div>

> **Release status:** This repository contains a responsive web application built with Vite and React. It does not currently include a native Android or iOS project, store listing, or CI workflow. The mobile platform badge describes the current release status—not a published native app.

## Live app

Frenchéfy is available as a web app at [frenchefy.netlify.app](https://frenchefy.netlify.app/). No native Android or iOS app is currently published.

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
│   ├── frenchefy-logo.png
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

## Legal & Contact

- **Live app:** [frenchefy.netlify.app](https://frenchefy.netlify.app/)
- **Privacy policy:** [frenchefy.netlify.app/privacy](https://frenchefy.netlify.app/privacy)
- **Terms of service:** [frenchefy.netlify.app/terms](https://frenchefy.netlify.app/terms)
- **License:** This repository is distributed under the [MIT License](./LICENSE).
- **Support:** [Email Ajay Kumar Reddy](mailto:ajayreddy.tech@gmail.com?subject=App%20Support%20Request%20-%20Frenchéfy)
- **Developer support:** [Ko-fi](https://ko-fi.com/ajayreddytech) is voluntary and does not unlock app features.

> This project has not been reviewed or certified as compliant with Google Play or Apple App Store policies. Store requirements depend on the final app package, data practices, disclosures, age/content ratings, and current platform policies. Complete those reviews before submitting.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and use the issue and pull-request templates.
