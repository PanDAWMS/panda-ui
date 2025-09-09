#!/bin/bash

set -e
export PYTHONPATH=/opt/prod/pandaui/backend

# Activate virtualenv
source /opt/prod/venv/bin/activate

# Start NGINX
echo "Starting NGINX..."
nginx -g "daemon off;" &

# Start Daphne server (ASGI)
echo "Starting Daphne ASGI server..."
exec /opt/prod/venv/bin/daphne -u /tmp/daphne.sock rest_api.asgi:application

