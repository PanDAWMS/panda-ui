"""
Database settings for the Django application.
"""
import json
import os

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# Default schema for the database
DATABASE_SCHEMA_PANDA_UI = os.getenv('PANDAUI_DATABASE_SCHEMA_PANDAUI')

# Database
DATABASES = {
    'default': {},
}
# Connection config dict
DATABASE_PANDA_UI = json.loads(os.getenv('PANDAUI_DATABASE_CONNECTION_PANDAUI'))
if DATABASE_PANDA_UI["VENDOR"] == 'oracle':
    DATABASES["default"] = DATABASE_PANDA_UI
    DATABASES["default"]["ENGINE"] = 'django.db.backends.oracle'
    # initialize Oracle thick client with the tnsnames
    try:
        import oracledb
        oracledb.init_oracle_client(config_dir='/etc/tnsnames.ora')
    except Exception as e:
        raise Exception(f"Error initializing Oracle client: {e}")
elif DATABASE_PANDA_UI["VENDOR"] == 'postgresql':
    DATABASES["default"] = DATABASE_PANDA_UI
    DATABASES["default"]["ENGINE"] = 'django.db.backends.postgresql'
