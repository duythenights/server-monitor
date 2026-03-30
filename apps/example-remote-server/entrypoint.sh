#!/bin/bash
set -e

echo "==> Starting Fluent Bit..."
/opt/fluent-bit/bin/fluent-bit -c /fluent-bit/etc/fluent-bit.conf &
FB_PID=$!

echo "==> Starting Node.js application..."
node /app/index.js &
NODE_PID=$!

# Trap signals and forward to both processes
trap "kill $FB_PID $NODE_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Wait for either process to exit
wait -n $FB_PID $NODE_PID
EXIT_CODE=$?

# If one dies, kill the other
kill $FB_PID $NODE_PID 2>/dev/null
exit $EXIT_CODE
