#!/usr/bin/env bash

# ==============================================================================
# Production DigitalOcean Droplet Deployment Script for KAKSEDTHAN ERP
# Server IP: 178.128.52.192
# Subdomain & Domains: livestock.kaksedthan.com, kaksedthan.com, www.kaksedthan.com
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}🚀 Initializing KAKSEDTHAN Production Setup for livestock.kaksedthan.com...${RESET}"

# 1. Update APT packages and install dependencies
echo -e "${BOLD}[1/6] Installing Docker, Nginx, and Certbot SSL tools...${RESET}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git docker.io docker-compose docker-compose-v2 nginx certbot python3-certbot-nginx 2>/dev/null || sudo apt install -y curl git docker.io docker-compose nginx certbot python3-certbot-nginx

# 2. Enable & start Docker service
echo -e "${BOLD}[2/6] Enabling Docker daemon...${RESET}"
sudo systemctl enable --now docker

# 3. Setup Nginx Reverse Proxy for Subdomain & Root Domain
echo -e "${BOLD}[3/6] Configuring Nginx reverse proxy for livestock.kaksedthan.com...${RESET}"
sudo tee /etc/nginx/sites-available/kaksedthan > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name livestock.kaksedthan.com kaksedthan.com www.kaksedthan.com 178.128.52.192;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/kaksedthan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 4. Spin up Docker containers
echo -e "${BOLD}[4/6] Building & launching Docker containers (PostgreSQL + Next.js App)...${RESET}"
docker compose up -d --build 2>/dev/null || docker-compose up -d --build

# 5. Run DB Schema Migration & Seed
echo -e "${BOLD}[5/6] Running PostgreSQL Database Schema Migrations...${RESET}"
sleep 5
docker exec -i livestock_app_backend npm run db:migrate || true

# 6. Obtain SSL HTTPS Certificate via Certbot (if DNS is resolved)
echo -e "${BOLD}[6/6] Requesting Free Let's Encrypt HTTPS Certificate...${RESET}"
if certbot --nginx -d livestock.kaksedthan.com -d kaksedthan.com -d www.kaksedthan.com --non-interactive --agree-tos -m admin@kaksedthan.com --redirect; then
  echo -e "${GREEN}✓ SSL HTTPS Certificate successfully issued for livestock.kaksedthan.com!${RESET}"
else
  echo -e "${YELLOW}⚠️ DNS propagation for livestock.kaksedthan.com may still be in progress.${RESET}"
  echo -e "${YELLOW}   Run 'sudo certbot --nginx -d livestock.kaksedthan.com -d kaksedthan.com -d www.kaksedthan.com' manually once GoDaddy DNS updates.${RESET}"
fi

echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 KAKSEDTHAN Production Deployment Complete!${RESET}"
echo -e "${BOLD}${GREEN}======================================================================${RESET}"
echo -e "   • Subdomain (HTTPS):      ${CYAN}https://livestock.kaksedthan.com${RESET}"
echo -e "   • Main Domain (HTTPS):    ${CYAN}https://kaksedthan.com${RESET}"
echo -e "   • WWW Alias:              ${CYAN}https://www.kaksedthan.com${RESET}"
echo -e "   • Direct Server IP:       ${CYAN}http://178.128.52.192${RESET}"
echo -e "======================================================================\n"
