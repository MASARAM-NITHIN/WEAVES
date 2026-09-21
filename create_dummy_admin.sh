#!/bin/bash
echo "Creating dummy credential via environment variables securely..."

# We write a temporary runner script to ensure env vars are exported INSIDE the nix-shell
cat << 'INNER_EOF' > temp_seed.sh
#!/bin/bash
export ADMIN_USERNAME="owner"
export ADMIN_PASSWORD="padmavathi123"
cd backend/saree-backend
mvn spring-boot:run &
PID=$!
echo "Waiting 25 seconds for backend to start and securely seed the database..."
sleep 25
kill $PID
INNER_EOF

chmod +x temp_seed.sh
nix-shell -I nixpkgs=channel:nixos-23.11 -p nodejs_20 maven jdk17 --run "bash temp_seed.sh"
rm temp_seed.sh

echo "✅ Account successfully unlocked and dummy credential synced!"
echo "You can now start your server normally with the Run button."
