#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION_FILE="${REPO_ROOT}/VERSION"
BRANCH="${GITHUB_REF_NAME:-next}"
echo "On branch: $BRANCH"

# Read current version (default 0.0 if empty)
current=$(cat "$VERSION_FILE" 2>/dev/null || echo "0.0")
IFS='.' read -r major minor <<< "$current"

# Increment major, reset minor
major=$((major + 1))
minor=0

new_version="${major}.${minor}"
echo "$new_version" > "$VERSION_FILE"

cd "$REPO_ROOT"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

git add "$VERSION_FILE"
git commit -m "Bump version to $new_version"
git tag "v$new_version"
git push origin HEAD:refs/heads/$BRANCH
git push origin --tags
