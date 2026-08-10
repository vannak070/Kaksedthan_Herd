#!/bin/bash
# =============================================================================
# Kaksedthan Herdbook — Full Production Server Setup Script
# Server: 178.128.213.139 | Domain: livestock.kaksedthan.com
# =============================================================================
set -e

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
header()  { echo -e "\n${BLUE}══════════════════════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}══════════════════════════════════════════════${NC}\n"; }

# ── Config ────────────────────────────────────────────────────────────────────
APP_DIR="/var/www/kaksedthan"
REPO_URL="https://github.com/vannak070/Kaksedthan_Herd.git"
DOMAIN="livestock.kaksedthan.com"
APP_PORT=3000
API_PORT=5001
DB_NAME="kaksedthan_herdbook"
DB_USER="herdbook_user"
DB_PASS="Herdbook@Secure$(openssl rand -hex 6)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_VERSION="20"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Kaksedthan Herdbook — Production Server Setup   ║${NC}"
echo -e "${GREEN}║   Domain: livestock.kaksedthan.com                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Phase 1: System Update ────────────────────────────────────────────────────
header "Phase 1 — System Update & Tools"
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw nginx certbot python3-certbot-nginx
success "System updated and tools installed"

# ── Phase 2: Firewall ─────────────────────────────────────────────────────────
header "Phase 2 — Firewall (UFW)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   comment 'SSH'
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'
ufw --force enable
success "Firewall configured: ports 22, 80, 443 open"

# ── Phase 3: Node.js & PM2 ────────────────────────────────────────────────────
header "Phase 3 — Node.js ${NODE_VERSION} LTS & PM2"
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - -qq
  apt-get install -y -qq nodejs
fi
node_ver=$(node --version)
npm_ver=$(npm --version)
success "Node.js ${node_ver} and npm ${npm_ver} installed"

npm install -g pm2 --quiet
pm2 startup systemd -u root --hp /root | tail -1 | bash || true
success "PM2 installed and configured for auto-start"

# ── Phase 4: PostgreSQL ───────────────────────────────────────────────────────
header "Phase 4 — PostgreSQL 16"
if ! command -v psql &>/dev/null; then
  apt-get install -y -qq postgresql postgresql-contrib
fi
systemctl start postgresql
systemctl enable postgresql

# Create DB and user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
success "PostgreSQL database '${DB_NAME}' and user '${DB_USER}' created"

# ── Phase 5: Clone Application ────────────────────────────────────────────────
header "Phase 5 — Clone Repository"
rm -rf ${APP_DIR}
git clone ${REPO_URL} ${APP_DIR}
cd ${APP_DIR}
success "Repository cloned to ${APP_DIR}"

# ── Phase 6: Create .env ──────────────────────────────────────────────────────
header "Phase 6 — Create Environment File"
cat > ${APP_DIR}/.env << EOF
# ── Database ──────────────────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
DB_SSL=false
DB_POOL_MAX=20
DB_IDLE_TIMEOUT_MS=30000
DB_CONN_TIMEOUT_MS=5000

# ── App ───────────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=${APP_PORT}
API_PORT=${API_PORT}
NEXT_PUBLIC_API_URL=https://${DOMAIN}

# ── Auth ──────────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://${DOMAIN}

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ORIGIN=https://${DOMAIN}

# ── Uploads ───────────────────────────────────────────────────────────────────
UPLOAD_DIR=/var/www/kaksedthan/uploads
MAX_FILE_SIZE=52428800
EOF
success ".env file created"

# ── Phase 7: Create uploads directory ────────────────────────────────────────
mkdir -p ${APP_DIR}/uploads
chmod 755 ${APP_DIR}/uploads
success "Uploads directory created"

# ── Phase 8: Run DB Schema ────────────────────────────────────────────────────
header "Phase 7 — Database Schema & Migrations"
sudo -u postgres psql -d ${DB_NAME} -f ${APP_DIR}/src/db/schema.sql
success "Database schema applied"

# ── Phase 9: Install Dependencies & Build ─────────────────────────────────────
header "Phase 8 — Install Dependencies & Build"
cd ${APP_DIR}
npm install --legacy-peer-deps
info "Running Next.js production build (this takes 3–5 minutes)..."
npm run build
success "Application built successfully"

# ── Phase 10: PM2 Ecosystem ───────────────────────────────────────────────────
header "Phase 9 — PM2 Process Configuration"
cat > ${APP_DIR}/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'kaksedthan-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/kaksedthan',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/kaksedthan/web-error.log',
      out_file: '/var/log/kaksedthan/web-out.log',
      log_file: '/var/log/kaksedthan/web-combined.log'
    },
    {
      name: 'kaksedthan-api',
      script: 'node_modules/.bin/tsx',
      args: 'src/server/index.ts',
      cwd: '/var/www/kaksedthan',
      env: {
        NODE_ENV: 'production',
        API_PORT: 5001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/kaksedthan/api-error.log',
      out_file: '/var/log/kaksedthan/api-out.log',
      log_file: '/var/log/kaksedthan/api-combined.log'
    }
  ]
};
EOF

mkdir -p /var/log/kaksedthan
success "PM2 ecosystem file created"

# ── Phase 11: Nginx Config ────────────────────────────────────────────────────
header "Phase 10 — Nginx Reverse Proxy"
cat > /etc/nginx/sites-available/kaksedthan << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Max upload size (for animal images)
    client_max_body_size 200M;

    # Next.js static assets (cached)
    location /_next/static/ {
        alias ${APP_DIR}/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploaded animal images
    location /uploads/ {
        alias ${APP_DIR}/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Express API
    location /api/v1/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }

    # Next.js app (all other routes)
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/kaksedthan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
success "Nginx configured and restarted"

# ── Phase 12: Start Application ───────────────────────────────────────────────
header "Phase 11 — Start Application with PM2"
cd ${APP_DIR}
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
success "Application started with PM2"

# ── Phase 13: SSL Certificate ─────────────────────────────────────────────────
header "Phase 12 — SSL Certificate (Let's Encrypt)"
info "Obtaining SSL certificate for ${DOMAIN}..."
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect || warn "SSL setup skipped — make sure DNS is pointed to this server first, then run: certbot --nginx -d ${DOMAIN}"

# ── Phase 14: Seed Default Data ───────────────────────────────────────────────
header "Phase 13 — Seed Default System Data"
cd ${APP_DIR}
npm run seed 2>/dev/null || warn "Seed script skipped (non-critical)"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅  SETUP COMPLETE — KAKSEDTHAN HERDBOOK          ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  🌐 URL:      https://${DOMAIN}          ║${NC}"
echo -e "${GREEN}║  📁 App Dir:  ${APP_DIR}                  ║${NC}"
echo -e "${GREEN}║  🗄️  Database: ${DB_NAME}           ║${NC}"
echo -e "${GREEN}║  👤 DB User:  ${DB_USER}                     ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${YELLOW}║  🔑 SAVE YOUR DB PASSWORD:                                ║${NC}"
echo -e "${YELLOW}║  ${DB_PASS}${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  pm2 status          — check running processes            ║${NC}"
echo -e "${GREEN}║  pm2 logs            — view application logs              ║${NC}"
echo -e "${GREEN}║  pm2 restart all     — restart all processes              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
