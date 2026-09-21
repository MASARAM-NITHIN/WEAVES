#!/bin/bash
echo "🌍 Generating public link for your friends..."
echo "Waiting for 3 seconds to ensure Next.js is running..."
sleep 3
# Run npx using the nix-shell environment since Replit's default environment is missing Node.js
nix-shell -I nixpkgs=channel:nixos-23.11 -p nodejs_20 --run "npx localtunnel --port 3000 --local-host 0.0.0.0"
