#!/usr/bin/env bash

# ==============================================================================
# Fast Local App Deployment Script for KAKSEDTHAN ERP
# Updates the running application container cleanly in ~10 seconds.
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}🚀 Launching Fast Local Deployment for KAKSEDTHAN ERP...${RESET}"

DOCKER_COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
fi

# Auto-detect local Wi-Fi / LAN IP address
DETECTED_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1 || echo "")
export NEXT_PUBLIC_LAN_IP=${DETECTED_IP:-"127.0.0.1"}
export LAN_IP=${DETECTED_IP:-"127.0.0.1"}

echo -e "${BOLD}[1/2] Updating & rebuilding application container (LAN IP: ${NEXT_PUBLIC_LAN_IP})...${RESET}"
$DOCKER_COMPOSE_CMD up -d --build app

echo -e "${BOLD}[2/2] Running database schema migration...${RESET}"
docker exec -i livestock_app_backend npm run db:migrate || npm run db:migrate

echo -e "\n${BOLD}${GREEN}======================================================================${RESET}"
echo -e "${BOLD}${GREEN} 🎉 Deployment Successful!${RESET}"
echo -e "${BOLD}${GREEN}======================================================================${RESET}"
echo -e "   • Frontend Application UI: ${CYAN}http://localhost:3000${RESET}"
echo -e "   • Mobile Wi-Fi Access:    ${CYAN}http://${NEXT_PUBLIC_LAN_IP}:3000${RESET}"
echo -e "   • Backend REST API Base:   ${CYAN}http://localhost:5001/api/v1${RESET}"
echo -e "   • Backend Health Endpoint: ${CYAN}http://localhost:5001/health${RESET}"
echo -e "======================================================================\n"
