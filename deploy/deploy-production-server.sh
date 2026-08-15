#!/usr/bin/env bash

# ==============================================================================
# 🚀 KAKSEDTHAN HERDBOOK — Production Automated Deployment Script
# Dedicated Target Subdomain: livestock.kaksedthan.com
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}======================================================================${RESET}"
echo -e "${BOLD}${CYAN}🚀 Initializing KAKSEDTHAN Production Setup for livestock.kaksedthan.com${RESET}"
echo -e "${BOLD}${CYAN}======================================================================${RESET}"

# 1. Install System Dependencies (Node.js 20, PostgreSQL 16, PM2, Nginx)
echo -e "\n${BOLD}[1/7] Installing System Dependencies (Node.js, PostgreSQL, PM2, Nginx)...${RESET}"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update && sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
sudo apt-get install -y curl git build-essential nginx postgresql postgresql-contrib

if ! command -v node &> /dev/null; then
  echo -e "${CYAN}Installing Node.js 20 LTS...${RESET}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
  echo -e "${CYAN}Installing PM2 Process Manager globally...${RESET}"
  sudo npm install -g pm2
fi

# 2. Configure PostgreSQL Database (livestock_db)
echo -e "\n${BOLD}[2/7] Configuring PostgreSQL Database (livestock_db)...${RESET}"
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';" || true
sudo -u postgres psql -c "CREATE DATABASE livestock_db OWNER postgres;" || true

# 3. Configure Environment Variables (.env)
echo -e "\n${BOLD}[3/7] Setting up Production Environment Variables (.env)...${RESET}"
cat << 'EOF' > .env
NODE_ENV=production
PORT=3000
API_PORT=3002
NEXT_PUBLIC_API_URL=/api/v1

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=livestock_db
DB_SSL=false
DB_POOL_MAX=20
DB_IDLE_TIMEOUT_MS=30000
DB_CONN_TIMEOUT_MS=5000
EOF

# 4. Install Node.js Application Dependencies
echo -e "\n${BOLD}[4/7] Installing Node.js Application Dependencies...${RESET}"
npm install --production=false --silent

# 5. Database Schema Initialization & Full Snapshot Restoration
echo -e "\n${BOLD}[5/7] Executing Database Migrations & Initializing Master Data...${RESET}"
DB_PORT=5432 DB_NAME=livestock_db npm run safe-migrate
DB_PORT=5432 DB_NAME=livestock_db npx tsx src/db/migrations/add-level-type-to-user-levels.ts
DB_PORT=5432 DB_NAME=livestock_db npx tsx src/db/migrations/seed-breed-configs.ts

if [ -f "src/data/localhost_full_snapshot.json" ]; then
  echo -e "${CYAN}Importing full database snapshot (70 cattle, 100 weight logs, 106 expenses)...${RESET}"
  DB_PORT=5432 DB_NAME=livestock_db npx tsx src/db/migrations/import-prod-full-snapshot.ts || true
fi

# 6. Build Next.js Production Package
echo -e "\n${BOLD}[6/7] Building Next.js Production Application...${RESET}"
npm run build

# 7. Configure Nginx & Start PM2 Services
echo -e "\n${BOLD}[7/7] Configuring Dedicated Nginx Block & PM2 Autostart...${RESET}"
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name livestock.kaksedthan.com;

    client_max_body_size 50M;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:3002/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 404;
}
EOF

sudo nginx -t && sudo systemctl reload nginx

pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --update-env
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root || true

echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 KAKSEDTHAN PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!${RESET}"
echo -e "${BOLD}${GREEN}======================================================================${RESET}"
echo -e "   • Production App URL:      ${CYAN}https://livestock.kaksedthan.com${RESET}"
echo -e "   • Super Admin Email:       ${CYAN}admin@kaksedthan.com${RESET}"
echo -e "   • Super Admin Password:    ${CYAN}password123${RESET}"
echo -e "======================================================================\n"
