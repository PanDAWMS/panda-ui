import os

from dotenv import load_dotenv

ENVIRONMENT = os.getenv("DJANGO_ENVIRONMENT", "production")

# Load environment variables from .env file
if ENVIRONMENT == "development":
    PATH_ENV_FILE = os.getenv("PATH_ENV_FILE", "/tmp/.env")
    load_dotenv(PATH_ENV_FILE)
print(ENVIRONMENT)

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
