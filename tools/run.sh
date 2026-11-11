#!/bin/sh
# Headless match runner; see tools/run.py (tools/run.sh -h for usage).
exec python3 "$(dirname "$0")/run.py" "$@"
