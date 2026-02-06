#!/bin/bash

set -e
export PYTHONPATH=/opt/pandaui/backend

# Activate virtualenv
source /opt/pandaui/venv/bin/activate

echo "Marking migrations as applied (fake) to trigger post migration signals"
python manage.py migrate --fake --noinput

# Start NGINX
echo "Starting NGINX..."
nginx -g "daemon off;" &

# Start Daphne server (ASGI)
echo "Starting Daphne ASGI server..."
exec /opt/pandaui/venv/bin/daphne -u /tmp/daphne.sock rest_api.asgi:application

