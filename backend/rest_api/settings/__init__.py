import os
from dotenv import load_dotenv

PATH_ENV_FILE = os.getenv('PATH_ENV_FILE', '/data_aipanda163/tk/private/.env')

# Load environment variables from .env file
load_dotenv(PATH_ENV_FILE)

ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')

from .base import *
from .database import *
from .oauth import *
from .logging import *

# import all settings from the development file which will override the base settings
if ENVIRONMENT != 'production':
    from .development import *