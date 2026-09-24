"""
Django Settings Module Entrypoint.

Handles environment detection, configuration file loading, and settings aggregation
for core, VO-specific, and environment-dependent overrides.

Configuration Flow:
    1. Environment Detection & Variable Loading:
       - Evaluates `DJANGO_ENVIRONMENT` (defaults to "production").
       - In non-production environments, validates and loads local `.env` variables
         via `python-dotenv`. Raises `ImportError` if `python-dotenv` is missing
         or `FileNotFoundError` if the `.env` file does not exist at `PATH_ENV_FILE`.

    2. Core Settings Composition:
       - Imports base configurations (base settings, database, logging, OAuth).
       - Merges Virtual Organization (VO) extensions if `INSTALLED_APPS_VO` is defined.

    3. Development Overrides:
       - Applies overrides from `.development` when `DJANGO_ENVIRONMENT != "production"`.
       - Appends developer-specific tools (`INSTALLED_APPS_DEV`) to `INSTALLED_APPS`.
"""

# pylint: disable=wrong-import-position

import os

ENVIRONMENT = os.getenv("DJANGO_ENVIRONMENT", "production")

# Load environment variables from .env file
if ENVIRONMENT == "development":
    try:
        from dotenv import load_dotenv
    except ImportError as err:
        raise ImportError("python-dotenv is not installed. Please use docker/backend/requirements/development.txt for dev environments.") from err
    PATH_ENV_FILE = os.getenv("PATH_ENV_FILE", "/tmp/.env")
    if not os.path.exists(PATH_ENV_FILE):
        raise FileNotFoundError(f"Development environment file not found at '{PATH_ENV_FILE}'. ")
    load_dotenv(PATH_ENV_FILE)

from .base import *  # noqa: F403, F401, E402
from .database import *  # noqa: F403, F401, E402
from .logging import *  # noqa: F403, F401, E402
from .oauth import *  # noqa: F403, F401, E402

# Load VO-specific settings and apply them
from .vo import *  # noqa: F403, F401, E402

if "INSTALLED_APPS_VO" in locals():
    INSTALLED_APPS += INSTALLED_APPS_VO  # noqa: F405


# import all settings from the development file which will override the base settings
if ENVIRONMENT != "production":
    from .development import *  # noqa: F403, F401, E402

    if "INSTALLED_APPS_DEV" in locals():
        INSTALLED_APPS += INSTALLED_APPS_DEV  # noqa: F405
