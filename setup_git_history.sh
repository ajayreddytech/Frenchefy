#!/usr/bin/env bash
set -euo pipefail

# Establish an honest repository baseline. This script intentionally creates
# only one commit for the current snapshot; it does not backdate or invent work.

if ! command -v git >/dev/null 2>&1; then
  echo "Error: Git is required but was not found on PATH." >&2
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "Error: run this script from the project root (package.json was not found)." >&2
  exit 1
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this directory is already inside a Git repository; refusing to alter its history." >&2
  exit 1
fi

if ! git var GIT_AUTHOR_IDENT >/dev/null 2>&1; then
  echo "Configure your Git identity first:" >&2
  echo '  git config --global user.name "Your Name"' >&2
  echo '  git config --global user.email "you@example.com"' >&2
  exit 1
fi

git init
git branch -M main
git add -A

if git diff --cached --quiet; then
  echo "Error: no files are staged for the initial repository snapshot." >&2
  exit 1
fi

git commit -m "chore: establish initial project repository"

cat <<'MESSAGE'

Created one initial commit using the current date and your configured Git identity.
Continue with genuine, incremental Conventional Commits as you make changes, e.g.:
  git add src/App.jsx
  git commit -m "feat(history): add keyboard navigation to calendar"

Do not fabricate past changes or release history. Create the first public tag
only when the corresponding release is actually ready:
  git tag -a v1.0.0 -m "Frenchefy v1.0.0"
MESSAGE
