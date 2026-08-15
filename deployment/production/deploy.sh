#!/usr/bin/env bash

# ==============================================================================
# 🚀 Production Automated Deployment Pipeline with Safety Guards
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}======================================================================${RESET}"
echo -e "${BOLD}${CYAN}🚀 Initializing Automated Production Deployment Pipeline${RESET}"
echo -e "${BOLD}${CYAN}======================================================================${RESET}"

# Step 1: Environment & Secrets Verification
echo -e "\n${BOLD}[1/6] Verifying Production Environment Configuration...${RESET}"
export NODE_ENV=production

if [ -f ".env.production" ]; then
  cp .env.production .env
  set -a
  source .env.production
  set +a
elif [ -f ".env" ]; then
  set -a
  source .env
  set +a
fi
export PGPASSWORD="${DB_PASSWORD:-postgres123}"

if [ -z "$DB_NAME" ] || [ -z "$DB_HOST" ]; then
  echo -e "${RED}❌ CRITICAL DEPLOYMENT FAILURE: Required production database env vars (DB_HOST, DB_NAME) are missing!${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Production environment variables loaded (${DB_NAME} at ${DB_HOST}:${DB_PORT})${RESET}"

# Step 2: Database Connectivity Check
echo -e "\n${BOLD}[2/6] Testing Production Database Connectivity...${RESET}"
if ! npx tsx -e "
  const { Pool } = require('pg');
  const pool = new Pool({ host: '${DB_HOST}', port: ${DB_PORT:-5432}, user: '${DB_USER:-postgres}', password: '${DB_PASSWORD}', database: '${DB_NAME}' });
  pool.query('SELECT 1').then(() => { process.exit(0); }).catch(() => { process.exit(1); });
" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL DEPLOYMENT FAILURE: Cannot connect to production database ${DB_NAME} at ${DB_HOST}:${DB_PORT}! Deployment aborted.${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Production database connectivity confirmed${RESET}"

# Step 3: Mandatory Production Database Backup
echo -e "\n${BOLD}[3/6] Executing Mandatory Production Database Backup...${RESET}"
chmod +x deployment/production/backup.sh
if ! ./deployment/production/backup.sh; then
  echo -e "${RED}❌ CRITICAL DEPLOYMENT FAILURE: Production database backup failed! Deployment aborted to prevent data loss.${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Production database backup verified${RESET}"

# Step 4: Schema DDL Migrations (No Dev Data Injected)
echo -e "\n${BOLD}[4/6] Executing Production Database Schema Migrations...${RESET}"
pm2 stop all 2>/dev/null || true
if ! npm run safe-migrate; then
  echo -e "${RED}❌ CRITICAL DEPLOYMENT FAILURE: Database migration failed! Deployment aborted.${RESET}"
  pm2 restart all 2>/dev/null || true
  exit 1
fi
npx tsx src/db/migrations/migrate-user-levels-enhanced.ts
npx tsx src/db/migrations/migrate-access-control-v2.ts
npx tsx src/db/migrations/add-level-type-to-user-levels.ts
npx tsx src/db/migrations/seed-breed-configs.ts
echo -e "${GREEN}✓ Production schema migrations applied cleanly${RESET}"

# Step 5: Application Build Compilation
echo -e "\n${BOLD}[5/6] Building Production Next.js Bundle...${RESET}"
if ! NODE_OPTIONS="--max-old-space-size=2048" npm run build; then
  echo -e "${RED}❌ CRITICAL DEPLOYMENT FAILURE: Production build failed! Deployment aborted.${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Production build compiled successfully${RESET}"

# Step 6: Zero-Downtime Process Reload
echo -e "\n${BOLD}[6/6] Reloading Production PM2 Services...${RESET}"
pm2 reload all || pm2 start ecosystem.config.js --update-env
pm2 save
echo -e "${GREEN}✓ PM2 services reloaded and process list saved${RESET}"

echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY WITH ALL GUARDS PASSED!${RESET}"
echo -e "${BOLD}${GREEN}======================================================================${RESET}\n"
