#!/bin/bash
set -e

# Find repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION_FILE="${REPO_ROOT}/VERSION"
BRANCH="${GITHUB_REF_NAME:-next}"
echo "On branch: $BRANCH"

# read current version, default to 0.0 if missing
current=$(cat "$VERSION_FILE" 2>/dev/null || echo "0.0")
IFS='.' read -r major minor <<< "$current"

# increment minor only
minor=$((minor + 1))
new_version="${major}.${minor}"
echo "$new_version" > "$VERSION_FILE"

cd "$REPO_ROOT"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

git add "$VERSION_FILE"
git commit -m "Bump minor version to $new_version"
# create tag only if it doesn't exist
if ! git rev-parse "v$new_version" >/dev/null 2>&1; then
    git tag "v$new_version"
fi
git push origin HEAD:refs/heads/$BRANCH
git push origin --tags


