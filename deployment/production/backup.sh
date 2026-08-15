#!/usr/bin/env bash

# ==============================================================================
# 🛡️ Production Database Automated Backup Script
# Creates compressed timestamped SQL dump before any deployment/migration
# ==============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/root/LiveStock/backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-livestock_db}"
BACKUP_FILE="${BACKUP_DIR}/prod_backup_${TIMESTAMP}.sql.gz"

echo "=== 🛡️ Initiating Automated Production Database Backup ==="
echo "   • Target Database: ${DB_NAME} at ${DB_HOST}:${DB_PORT}"
echo "   • Output File:     ${BACKUP_FILE}"

export PGPASSWORD="${DB_PASSWORD:-postgres123}"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Production database backup successfully created! Size: ${FILE_SIZE}"
  echo "   • Backup Timestamp: ${TIMESTAMP}"
  exit 0
else
  echo "❌ CRITICAL ERROR: Production database backup failed!"
  rm -f "$BACKUP_FILE" 2>/dev/null || true
  exit 1
fi
