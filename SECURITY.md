# Security Policy

## Supported releases

Security fixes are considered for the latest version on the default branch. No formal release support schedule is currently defined.

## Reporting a vulnerability

Please do not report exploitable security issues in public issues. Use GitHub's **Report a vulnerability** / private vulnerability reporting feature for this repository if it is enabled. If it is not enabled, contact the maintainer at [ajayreddy.tech@gmail.com](mailto:ajayreddy.tech@gmail.com?subject=Private%20security%20report) and request a private channel before sending sensitive technical details.

Include a description, affected version/commit, impact, and safe reproduction details. Please allow reasonable time for assessment and remediation before public disclosure.

## Data and deployment notes

- Study entries and preferences are stored in the browser's `localStorage`; they are not encrypted, synchronized, or backed up by this project.
- Do not submit private study records, credentials, or personal data in bug reports.
- Configure hosting with HTTPS. Never place private credentials in `VITE_` environment variables; Vite embeds those values into client-side assets.
- This repository does not currently include a native mobile application or backend service.
