#!/bin/bash

set -e
export PYTHONPATH=/opt/pandaui/pandaui

# Activate virtualenv
source /opt/pandaui/venv/bin/activate

# Start NGINX
echo "Starting NGINX..."
nginx -g "daemon off;" &

# Start Daphne server (ASGI)
echo "Starting Daphne ASGI server..."
/opt/pandaui/venv/bin/daphne -u /tmp/daphne.sock backend.rest_api.asgi:application &

# Ensure the process stays in the foreground
# If any of the previous processes exit, this script stops.
wait -n

# Graceful shutdown on termination signal
trap "echo 'Stopping services...'; nginx -s stop; exit 0" SIGINT SIGTERM

# Keep the container running
tail -f /dev/null
