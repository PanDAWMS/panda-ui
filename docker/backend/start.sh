#!/bin/bash

set -e
export PYTHONPATH=/opt/pandaui/backend

echo "Activating virtual env"
source /opt/pandaui/venv/bin/activate

echo "Marking migrations as applied (fake) to trigger post migration signals"
python /opt/pandaui/backend/manage.py migrate --fake --noinput

echo "Starting NGINX..."
nginx -g "daemon off;" &

echo "Starting Daphne ASGI server..."
exec /opt/pandaui/venv/bin/daphne -u /tmp/daphne.sock rest_api.asgi:application

