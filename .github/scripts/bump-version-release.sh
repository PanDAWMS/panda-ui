#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION_FILE="${REPO_ROOT}/VERSION"
BRANCH="${GITHUB_REF_NAME:-next}"
echo "On branch: $BRANCH"

cd "$REPO_ROOT"

# fetch the latest branch and attach HEAD
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard origin/"$BRANCH"   # ensure we match remote

# read current version (default 0.0 if empty) -> increment major, reset minor
current=$(cat "$VERSION_FILE" 2>/dev/null || echo "0.0")
IFS='.' read -r major minor <<< "$current"
major=$((major + 1))
minor=0
new_version="${major}.${minor}"
echo "$new_version" > "$VERSION_FILE"

# commit new version
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add "$VERSION_FILE"
git commit -m "Bump version to $new_version"

# create tag only if it doesn't exist
if ! git rev-parse "v$new_version" >/dev/null 2>&1; then
    git tag "v$new_version"
fi

# push commit and tags
git push origin "$BRANCH"
git push origin --tags
