"""
Database config for the Django application.

Here we dynamically load database configurations from environment variables
following the pattern DB_<CONNECTION>_<PROPERTY>. It supports multiple databases
(PostgreSQL, Oracle) and enforces that PANDAUI is always present as the default.

Features:
- Vendor-aware required fields validation
- Automatic Oracle thick client initialization using tnsnames.ora
- Populates Django DATABASES dictionary with 'default' set to PANDAUI
- Supports additional connections with lowercase keys

Environment variable examples:
    DB_PANDAUI_VENDOR=oracle
    DB_PANDAUI_NAME=pandaui
    DB_PANDAUI_USER=pandaui_user
    DB_PANDAUI_PASSWORD=secret
or
    DB_PANDAUI_VENDOR=postgresql
    DB_PANDAUI_NAME=panda
    DB_PANDAUI_USER=panda_user
    DB_PANDAUI_PASSWORD=secret
    DB_PANDAUI_HOST=panda-host.example.com
    DB_PANDAUI_PORT=5432
"""

import os
import re

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Database
DATABASES = {}
ENGINE_MAPPING = {
    "oracle": "django.db.backends.oracle",
    "postgresql": "django.db.backends.postgresql",
}
REQUIRED_FIELDS = {
    "oracle": ["VENDOR", "NAME", "USER", "PASSWORD"],
    "postgresql": ["VENDOR", "NAME", "USER", "PASSWORD", "HOST", "PORT"],
}

# Collect schema names from env
schema_env_vars = {k: v for k, v in os.environ.items() if k.startswith("DB_SCHEMA_")}
DB_SCHEMAS = {k[10:].lower(): v for k, v in schema_env_vars.items()}

# Get DB related config from env
db_env_vars = {k: v for k, v in os.environ.items() if k.startswith("DB_CONN_")}
db_configs = {}
pattern = re.compile(r"DB_CONN_(\w+)_(\w+)")
for key, value in db_env_vars.items():
    match = pattern.fullmatch(key)
    if match:
        conn_name, prop = match.groups()
        conn_name = conn_name.upper()
        prop = prop.upper()
        db_configs.setdefault(conn_name, {})[prop] = value

# Initialize Oracle thick client if needed
if any(cfg.get("VENDOR", "").lower() == "oracle" for cfg in db_configs.values()):
    try:
        import oracledb

        oracledb.init_oracle_client(config_dir="/etc/tnsnames.ora")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize thick Oracle client: {e}") from e

# Fill Django DATABASES dict
for conn_name, cfg in db_configs.items():
    vendor = cfg.get("VENDOR", "").lower()
    if not vendor:
        raise RuntimeError(f"Missing VENDOR for database connection {conn_name}")

    engine = ENGINE_MAPPING.get(vendor)
    if not engine:
        raise RuntimeError(f"Unsupported database vendor '{vendor}' for connection {conn_name}")

    # Check required fields per vendor
    for field in REQUIRED_FIELDS.get(vendor, []):
        if field not in cfg or not cfg[field].strip():
            raise RuntimeError(f"Missing {field} for database connection {conn_name} (vendor={vendor})")

    # Set default if this is the PANDAUI DB
    if conn_name == "PANDAUI":
        django_conn_name = "default"
    else:
        django_conn_name = conn_name.lower()
    DATABASES[django_conn_name] = {**cfg, "ENGINE": engine}

# Throw error if no default PANDAUI DB configured
if "default" not in DATABASES or not DATABASES["default"]:
    raise RuntimeError("PANDAUI database connection is required but not found in environment variables.")

# List of variables for export
__all__ = ["DATABASES", "DB_SCHEMAS", "DEFAULT_AUTO_FIELD"]
