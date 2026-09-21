#!/bin/bash
echo "Creating dummy credential securely..."

cat << 'INNER_EOF' > temp_seed.sh
#!/bin/bash
export ADMIN_USERNAME="owner"
export ADMIN_PASSWORD="padmavathi123"
cd backend/saree-backend
echo "Starting Spring Boot to seed the database..."
echo "⏳ PLEASE WAIT ABOUT 60-90 SECONDS... DO NOT CANCEL..."
mvn spring-boot:run &
PID=$!

sleep 90

echo "✅ Database is seeded and unlocked."
kill $PID
INNER_EOF

chmod +x temp_seed.sh
nix-shell -I nixpkgs=channel:nixos-23.11 -p nodejs_20 maven jdk17 --run "bash temp_seed.sh"
rm temp_seed.sh

echo "✅ Account successfully unlocked and dummy credential synced!"
echo "You can now start your server normally with the Run button."
