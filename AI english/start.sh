#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing processes on our ports
lsof -ti :3001 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti :5173 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# Start proxy server
node proxy-server.mjs &
PROXY_PID=$!
echo "Proxy PID: $PROXY_PID"

# Wait for proxy to be ready
sleep 1

# Start Vite
node ./node_modules/.bin/vite --port 5173 --host &
VITE_PID=$!
echo "Vite PID: $VITE_PID"

# Trap exit to clean up
trap "kill $PROXY_PID $VITE_PID 2>/dev/null" EXIT

echo "Both servers started"
wait
