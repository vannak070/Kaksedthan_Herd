# 🚀 KAKSEDTHAN HERDBOOK — Production Deployment Guide

This guide provides step-by-step instructions to deploy the **KAKSEDTHAN Herdbook ERP System** to a fresh Ubuntu 24.04 / 22.04 LTS production server (DigitalOcean, AWS, Linode, or bare-metal).

---

## 📋 System Prerequisites

| Component | Required Version / Specification |
| :--- | :--- |
| **Operating System** | Ubuntu 24.04 LTS / Ubuntu 22.04 LTS |
| **CPU & Memory** | Minimum 2 vCPUs, 4 GB RAM (Recommended 8 GB RAM) |
| **Storage** | 25 GB+ SSD |
| **Node.js** | Node.js v20.x LTS |
| **Database** | PostgreSQL 16 (`livestock_db`) |
| **Process Manager** | PM2 (`livestock-frontend-ui` & `livestock-backend-api`) |
| **Domain** | Dedicated Subdomain: `livestock.kaksedthan.com` |

---

## ⚡ Automated 1-Click Deployment

Once you have provisioned your new Ubuntu server, SSH into your server as `root` and run the following automated setup:

```bash
# 1. Clone or Upload the project directory to /root/LiveStock
git clone https://github.com/vannak070/Kaksedthan_Herd.git /root/LiveStock
cd /root/LiveStock

# 2. Make the deployment script executable
chmod +x deploy/deploy-production-server.sh

# 3. Execute automated production setup
./deploy/deploy-production-server.sh
```

---

## 🛠️ Manual Deployment Steps (If preferred)

### Step 1: Environment Variables Setup
Create a `.env` file in the root directory:

```env
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
```

### Step 2: Database Initialization & Migrations
```bash
# Run non-destructive table migrations
DB_PORT=5432 DB_NAME=livestock_db npm run safe-migrate

# Apply user levels & permissions classification
DB_PORT=5432 DB_NAME=livestock_db npx tsx src/db/migrations/add-level-type-to-user-levels.ts

# Seed master breed configurations
DB_PORT=5432 DB_NAME=livestock_db npx tsx src/db/migrations/seed-breed-configs.ts
```

### Step 3: Next.js Production Build
```bash
npm run build
```

### Step 4: PM2 Service Startup & Autostart
```bash
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 startup systemd
```

### Step 5: Nginx Configuration (`/etc/nginx/sites-available/default`)
```nginx
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
```

---

## 🔐 Default Super Admin Credentials

- **URL**: [https://livestock.kaksedthan.com](https://livestock.kaksedthan.com)
- **Super Admin Email**: `admin@kaksedthan.com`
- **Password**: `password123`
