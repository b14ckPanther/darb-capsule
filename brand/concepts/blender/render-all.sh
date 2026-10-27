#!/bin/sh
# Renders all four Capsule directions at full size into ../  (blender on PATH)
cd "$(dirname "$0")"
for d in inside widget pop checkin; do blender -b -P capsule.py -- "$d" "$PWD/../$d-full.png" "${SIZE:-1024}" "${SAMPLES:-192}" 2>&1 | grep -E "rendered|Error|Traceback"; done
