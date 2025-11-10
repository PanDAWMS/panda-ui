import os
from dotenv import load_dotenv

ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')

# Load environment variables from .env file
if ENVIRONMENT == 'development':
    PATH_ENV_FILE = os.getenv('PATH_ENV_FILE', '/tmp/.env')
    load_dotenv(PATH_ENV_FILE)

from .base import *
from .database import *
from .oauth import *
from .logging import *

# import all settings from the development file which will override the base settings
if ENVIRONMENT != 'production':
    from .development import *