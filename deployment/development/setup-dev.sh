#!/usr/bin/env bash

# ==============================================================================
# 🛠️ Local Development Environment Setup Script
# Initializes local PostgreSQL (Docker port 5433 / kaksedthan_herdbook), .env.development, schema, and dev seeds
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}======================================================================${RESET}"
echo -e "${BOLD}${CYAN}🛠️  Initializing Local Development Environment (Localhost)${RESET}"
echo -e "${BOLD}${CYAN}======================================================================${RESET}"

# 1. Environment Setup
if [ ! -f ".env.development" ]; then
  echo -e "\n${BOLD}[1/4] Creating .env.development from template...${RESET}"
  cp .env.example .env.development
fi

export NODE_ENV=development
export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=postgres
export DB_PASSWORD=postgres123
export DB_NAME=kaksedthan_herdbook
export UPLOAD_DIR=uploads/dev

echo -e "${GREEN}✓ Local development environment variables set (${DB_NAME} at ${DB_HOST}:${DB_PORT})${RESET}"

# 2. Check Local PostgreSQL Container
echo -e "\n${BOLD}[2/4] Ensuring Local PostgreSQL Container is running on port 5433...${RESET}"
if command -v docker-compose &> /dev/null; then
  docker-compose up -d db
elif command -v docker &> /dev/null; then
  docker compose up -d db
fi
echo -e "${GREEN}✓ Local PostgreSQL database service ready${RESET}"

# 3. Apply Local Schema Migrations
echo -e "\n${BOLD}[3/4] Running Local Database Schema Migrations...${RESET}"
npm run safe-migrate
npx tsx src/db/migrations/add-level-type-to-user-levels.ts
echo -e "${GREEN}✓ Local database schema initialized${RESET}"

# 4. Optional Dev Seeding
echo -e "\n${BOLD}[4/4] Seeding Development Sample & Test Data...${RESET}"
npm run db:seed:dev
echo -e "${GREEN}✓ Local development seeding completed${RESET}"

echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 LOCAL DEVELOPMENT ENVIRONMENT READY!${RESET}"
echo -e "${BOLD}${GREEN} Run 'npm run dev:all' to start local dev servers.${RESET}"
echo -e "${BOLD}${GREEN}======================================================================${RESET}\n"
