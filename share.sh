#!/bin/bash
echo "🌍 Generating public link for your friends..."
echo "Waiting for 3 seconds to ensure Next.js is running..."
sleep 3
npx localtunnel --port 3000 --local-host 0.0.0.0
