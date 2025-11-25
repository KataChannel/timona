#!/bin/bash

# Kill any existing node processes on port 3001-3005
for port in 3001 3002 3003 3004 3005; do
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
done

sleep 1

# Start VTTECH server
cd /chikiet/kataoffical/fullstack/katacore/external
export PORT=3001
node servervttech.js

