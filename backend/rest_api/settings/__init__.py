import os

from dotenv import load_dotenv

ENVIRONMENT = os.getenv("DJANGO_ENVIRONMENT", "production")

# Load environment variables from .env file
if ENVIRONMENT == "development":
    PATH_ENV_FILE = os.getenv("PATH_ENV_FILE", "/tmp/.env")
    load_dotenv(PATH_ENV_FILE)

from .base import *  # noqa: F403, F401, E402
from .database import *  # noqa: F403, F401, E402
from .logging import *  # noqa: F403, F401, E402
from .oauth import *  # noqa: F403, F401, E402

# import all settings from the development file which will override the base settings
if ENVIRONMENT != "production":
    from .development import *  # noqa: F403, F401, E402
