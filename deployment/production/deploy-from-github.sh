#!/usr/bin/env bash

# ==============================================================================
# 🚀 Production Deployment Script - Direct Pull from GitHub (origin/main)
# Downloads latest main branch from GitHub, backs up database, runs safe DDL
# migrations, builds Next.js production bundle, and reloads PM2 services.
# ==============================================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${BOLD}${BLUE}======================================================================${RESET}"
echo -e "${BOLD}${BLUE}🚀 Deploying Latest Code from GitHub (origin/main) to Production${RESET}"
echo -e "${BOLD}${BLUE}======================================================================${RESET}"

git config --global --add safe.directory /root/LiveStock 2>/dev/null || true

# 1. Ensure directory is a git repository linked to GitHub
if [ ! -d ".git" ]; then
  echo -e "${BLUE}Initializing Git repository link to GitHub...${RESET}"
  git init
fi
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/vannak070/Kaksedthan_Herd.git

# 2. Pull latest main branch from GitHub
echo -e "\n${BOLD}[1/3] Fetching and Pulling Latest Code from GitHub...${RESET}"
git fetch origin main
git reset --hard origin/main
git log -n 1 --oneline

# 3. Copy production environment file
echo -e "\n${BOLD}[2/3] Loading Production Environment Variables...${RESET}"
cp .env.production .env

# 4. Execute automated deployment pipeline
echo -e "\n${BOLD}[3/3] Executing Standard Production Deployment Pipeline...${RESET}"
chmod +x deployment/production/deploy.sh deployment/production/backup.sh
bash deployment/production/deploy.sh

echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 GITHUB PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!${RESET}"
echo -e "${BOLD}${GREEN}======================================================================${RESET}"
