# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PanDA UI is a web platform for the PanDA Workload Management System (WMS), providing monitoring and interactive control of workflow execution. It consists of an Angular 22 frontend and a Django 6 backend communicating via REST API and WebSockets.

## Commands

### Frontend (Angular)

```bash
cd frontend
npm install          # install dependencies
npm start            # dev server at http://localhost:4200
npm run build        # production build to dist/frontend/
npm run watch        # build with watch mode
npm test             # run tests (Vitest, via Angular's unit-test builder)
npm run lint         # ESLint
```

Run a single test file: `npx ng test --include='**/job-list.component.spec.ts'`

### Backend (Django)

```bash
cd backend
python manage.py runserver           # dev server
python manage.py migrate             # apply migrations
python manage.py makemigrations      # create migrations
python manage.py test                # run all tests
python manage.py test rest_api.job   # run tests for one app
```

Django settings module: `rest_api.settings`. Backend requires `DJANGO_SETTINGS_MODULE=rest_api.settings` and the env vars listed below; there's no sqlite fallback — `database.py` raises at import time if no `DB_CONN_PANDAUI_*` vars are set.

### Code Quality

```bash
pre-commit run --all-files   # run all pre-commit hooks
```

Pre-commit enforces:
- **Python**: Black (line length 160), isort (Django profile), Flake8 (line length 160)
- **Frontend**: ESLint, Prettier

### Docker

```bash
# Backend image build (from repo root)
docker build -f docker/backend/Dockerfile.backend .

# Frontend image build
docker build -f docker/frontend/Dockerfile.frontend .
```

The backend startup script (`docker/backend/start.sh`) runs migrations, starts Nginx, then launches Daphne (ASGI server).

## Architecture

### Frontend (`frontend/src/app/`)

Angular 22 with standalone components (no NgModules), signals for state management, and SSR enabled.

- **`core/`**: Singleton services, guards, interceptors, and layout components
  - `services/`: API client, auth, WebSocket, config, version, logging
  - `interceptors/`: HTTP error handling and token attachment
  - `guards/`: Route protection
- **`modules/`**: Lazy-loaded feature areas — `job/`, `task/`, `search/`, `auth/`, `home/`, `aide/`

Key constraints: ESLint enforces max 500 lines per file and cyclomatic complexity ≤ 20. TypeScript strict mode is on (noImplicitAny, strictNullChecks, strictPropertyInitialization).

### Backend (`backend/`)

Django REST Framework with async ASGI via Channels/Daphne. Supports WebSockets for real-time updates.

- **`rest_api/settings/`**: Split settings — `base.py`, `database.py`, `oauth.py`, `logging.py`, `vo.py`, `development.py`
- **`rest_api/<feature>/`**: Each domain (job, task, search, aide, oauth) has its own views, serializers, and models
- **`urls.py`**: Version-aware URL routing (v1 and v2 API)
- **`routing.py`**: WebSocket URL patterns
- **`asgi.py`** / **`wsgi.py`**: Application entry points

Database: Oracle (via `oracledb`). Authentication: OAuth (social-auth) + session + DRF token auth.

### Infrastructure

Nginx acts as reverse proxy for both frontend and backend. Docker images are built on AlmaLinux 9 and published to GitHub Container Registry. Version is tracked in `VERSION` and injected into `frontend/src/assets/version.json` at build time by CI.

## Environment Setup

Backend requires environment variables (see `/backend/rest_api/settings/` for references). Key variables include `PANDAUI_SECRET_KEY`, `PANDAUI_DEBUG`, `PANDAUI_ALLOWED_HOSTS`, Oracle DB credentials, and OAuth provider config. Use a `.env` file or set them in the shell.

Frontend environment config lives in `frontend/src/environments/`. The dev environment file is not committed; create it from the template if needed.

Database env vars follow the pattern `DB_CONN_<CONNECTION>_<PROPERTY>` (e.g. `DB_CONN_PANDAUI_VENDOR`, `_NAME`, `_USER`, `_PASSWORD`, plus `_HOST`/`_PORT` for PostgreSQL); the `PANDAUI` connection is required and becomes Django's `default` database (`backend/rest_api/settings/database.py`). Both Oracle and PostgreSQL are supported.

## Branching

- PRs target the `next` branch, not `main` directly. Merges to `next` auto-bump the minor version; pushes to `main` trigger the release workflow (Docker image build + publish to GHCR).
