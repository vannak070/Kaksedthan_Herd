#!/usr/bin/env bash

# ==============================================================================
# Livestock Management System (`livestock-mgt`)
# Automated Local Orchestration, Port Optimization, & Bootstrap Script
# ==============================================================================

set -e

# ANSI Color Codes for Rich Terminal Output
BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

# Load environment variables if .env exists
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_PORT="${PORT:-5001}"
DB_HOST_PORT="${DB_PORT:-5433}"
DB_CONTAINER_NAME="livestock_postgres_db"
APP_CONTAINER_NAME="livestock_app_backend"

echo -e "${BOLD}${CYAN}"
echo "======================================================================"
echo " 🚀 Livestock Management System Local Initialization & Startup"
echo "======================================================================"
echo -e "${RESET}"

# Detect docker-compose command
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
else
  echo -e "${RED}❌ Neither 'docker-compose' nor 'docker compose' was found in PATH.${RESET}"
  echo -e "${YELLOW}Please install Docker Desktop or Docker Compose to continue.${RESET}"
  exit 1
fi

# Stop existing containers for this project to free ports cleanly if re-running
echo -e "   Cleaning up existing project containers..."
$DOCKER_COMPOSE_CMD down --remove-orphans >/dev/null 2>&1 || true

# ------------------------------------------------------------------------------
# Step 1: Pre-flight Host Port Checks
# ------------------------------------------------------------------------------
echo -e "${BOLD}[1/5] Checking host port availability on localhost...${RESET}"

check_port() {
  local port=$1
  local service_name=$2
  
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo -e "${RED}❌ Port $port ($service_name) is currently OCCUPIED by another process listening on it!${RESET}"
    echo -e "${YELLOW}   Occupying process:${RESET}"
    lsof -iTCP:"$port" -sTCP:LISTEN || true
    echo -e "${RED}   Please stop the process running on port $port and rerun ./start-project.sh${RESET}"
    return 1
  else
    echo -e "   ${GREEN}✓ Port $port ($service_name) is FREE.${RESET}"
    return 0
  fi
}

PORT_ERRORS=0
check_port "$FRONTEND_PORT" "Frontend Next.js UI" || PORT_ERRORS=$((PORT_ERRORS + 1))
check_port "$BACKEND_PORT" "Backend Express API" || PORT_ERRORS=$((PORT_ERRORS + 1))
check_port "$DB_HOST_PORT" "PostgreSQL Database Host Port" || PORT_ERRORS=$((PORT_ERRORS + 1))

if [ $PORT_ERRORS -gt 0 ]; then
  echo -e "\n${RED}Aborting startup due to host port conflicts.${RESET}"
  exit 1
fi

echo -e "${GREEN}All required ports are free! Proceeding...${RESET}\n"

# ------------------------------------------------------------------------------
# Step 2: Container Launch with Docker Compose
# ------------------------------------------------------------------------------
echo -e "${BOLD}[2/5] Building & launching Docker containers...${RESET}"
echo -e "   Using command: ${CYAN}$DOCKER_COMPOSE_CMD up -d --build${RESET}"
$DOCKER_COMPOSE_CMD up -d --build

# ------------------------------------------------------------------------------
# Step 3: Database Health Check
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}[3/5] Waiting for PostgreSQL container ($DB_CONTAINER_NAME) health check...${RESET}"

MAX_RETRIES=30
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  CONTAINER_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' "$DB_CONTAINER_NAME" 2>/dev/null || echo '"unknown"')
  
  if [ "$CONTAINER_STATUS" = '"healthy"' ]; then
    HEALTHY=true
    break
  fi
  
  echo -e "   [Attempt $RETRY_COUNT/$MAX_RETRIES] Database status: ${YELLOW}$CONTAINER_STATUS${RESET}. Waiting 2s..."
  sleep 2
done

if [ "$HEALTHY" = true ]; then
  echo -e "   ${GREEN}✓ PostgreSQL database is active and ready to accept connections!${RESET}\n"
else
  echo -e "${RED}❌ PostgreSQL container failed to become healthy within timeout.${RESET}"
  echo -e "${YELLOW}Showing database container logs:${RESET}"
  docker logs --tail 20 "$DB_CONTAINER_NAME"
  exit 1
fi

# ------------------------------------------------------------------------------
# Step 4: Database Migrations & Data Seeding
# ------------------------------------------------------------------------------
echo -e "${BOLD}[4/5] Executing database migrations & data seeding...${RESET}"

echo -e "   Running migration script inside container..."
docker exec -i "$APP_CONTAINER_NAME" npm run db:migrate || {
  echo -e "${YELLOW}Container execution fallback: running migrations locally via host...${RESET}"
  npm run db:migrate
}

echo -e "   Running data seeding script..."
docker exec -i "$APP_CONTAINER_NAME" npm run db:seed || {
  echo -e "${YELLOW}Container execution fallback: running seeding locally via host...${RESET}"
  npm run db:seed
}

echo -e "   ${GREEN}✓ Migrations and Seeding completed successfully!${RESET}\n"

# ------------------------------------------------------------------------------
# Step 5: Setup & Endpoints Completion Summary
# ------------------------------------------------------------------------------
echo -e "${BOLD}${GREEN}"
echo "======================================================================"
echo " 🎉 Livestock Management System is fully operational!"
echo "======================================================================"
echo -e "${RESET}"

echo -e "${BOLD}Active Endpoints & Access Info:${RESET}"
echo -e "   • ${BOLD}Frontend Application UI:${RESET} ${CYAN}http://localhost:${FRONTEND_PORT}${RESET}"
echo -e "   • ${BOLD}Backend REST API Base:${RESET}   ${CYAN}http://localhost:${BACKEND_PORT}/api/v1${RESET}"
echo -e "   • ${BOLD}Backend Health Endpoint:${RESET} ${CYAN}http://localhost:${BACKEND_PORT}/health${RESET}"
echo -e "   • ${BOLD}PostgreSQL Database Host:${RESET} ${CYAN}localhost:${DB_HOST_PORT}${RESET} (Database: ${CYAN}livestock_db${RESET})"
echo ""
echo -e "${BOLD}Useful Commands:${RESET}"
echo -e "   • Stream container logs:  ${CYAN}$DOCKER_COMPOSE_CMD logs -f${RESET}"
echo -e "   • Stop containers:        ${CYAN}$DOCKER_COMPOSE_CMD down${RESET}"
echo -e "   • Run migration manually: ${CYAN}npm run db:migrate${RESET}"
echo -e "   • Run seeding manually:   ${CYAN}npm run db:seed${RESET}"
echo "======================================================================"
