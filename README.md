# 🐄 Kaksethan Livestock & Herdbook Management System

A production-grade Livestock & Pedigree Management Platform built with Next.js 16, TypeScript, TailwindCSS, Express, and PostgreSQL.

> 📘 **Official Technical Guide:** Refer to [`OFFICIAL_DEVELOPMENT_AND_DEPLOYMENT_GUIDE.md`](./OFFICIAL_DEVELOPMENT_AND_DEPLOYMENT_GUIDE.md) for the mandatory technical standards, API contracts, database migration rules, and fail-safe production deployment procedures.

---

## 🏗️ Environment & Deployment Architecture

This project enforces strict separation between **Development (Localhost)** and **Production** environments.

```text
Kaksethan_Herdbook/
├── config/
│   ├── database.ts             # Environment-aware Database Connection Pool
│   └── storage.ts              # Environment-aware Upload & Storage Configuration
├── deployment/
│   ├── development/
│   │   └── setup-dev.sh        # Localhost Dev Environment Setup Script
│   └── production/
│       ├── backup.sh           # Automated Production DB Backup Guard
│       ├── deploy.sh           # Fail-Safe Production Deployment Pipeline
│       └── nginx.conf          # Nginx Reverse Proxy Template
├── src/
│   ├── db/
│   │   ├── migrations/         # Schema-only DDL Migrations (Dev & Prod)
│   │   └── seeds/              # Localhost Development Sample Data Seeder
│   ├── lib/
│   └── server/
├── .env.example                # Environment Variable Template
├── .env.development            # Localhost Environment Configuration
├── .env.production.example     # Production Environment Template (Secrets NOT committed)
└── README.md
```

---

## ⚙️ Environment Comparison

| Feature / Setting | 🛠️ Development (Localhost) | 🚀 Production (`livestock.kaksedthan.com`) |
| :--- | :--- | :--- |
| **Env File** | `.env.development` | `.env.production` (Server-side) |
| **Database Host** | `localhost:5433` (Docker) | `127.0.0.1:5432` (PostgreSQL 16) |
| **Database Name** | `kaksedthan_herdbook` | `livestock_db` |
| **File Storage** | `public/uploads/dev/` | `public/uploads/prod/` |
| **API URL** | `http://localhost:5001/api/v1` | `/api/v1` (Nginx Proxy to `:3002`) |
| **Sample/Test Data** | Allowed (`npm run db:seed:dev`) | 🔴 **Forbidden** (Only Real Business Data) |
| **Database Backups** | Manual | 🛡️ **Automated pre-deployment backup** |

---

## 🛠️ Local Development Workflow

### 1. Setup Local Development Environment
```bash
npm run setup:dev
```

### 2. Start Development Servers
```bash
npm run dev:all
```
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)

---

## 🚀 Production Deployment Pipeline

Deploying to production executes an **automated, fail-safe 6-step deployment pipeline**:

```bash
npm run deploy:prod
```

### Automated Safety Pipeline Execution Steps:
1. **Environment & Secrets Guard**: Validates required production variables (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). Aborts if missing.
2. **Database Connection Guard**: Verifies database connectivity. Aborts if unreachable.
3. **Automated Production Backup**: Creates compressed timestamped dump `backups/prod_backup_YYYYMMDD_HHMMSS.sql.gz`. **Deployment aborts immediately if backup fails.**
4. **Schema-Only Migrations**: Applies DDL schema migrations (`safe-migrate.ts`). Aborts if migration fails.
5. **Production Build**: Compiles optimized Next.js production bundle. Aborts if build fails.
6. **Zero-Downtime PM2 Reload**: Reloads production UI and API PM2 services safely.

---

## 🛡️ Data Protection Rules

1. **Database Isolation**: Localhost development database (`kaksedthan_herdbook`) and production database (`livestock_db`) are completely independent.
2. **No Data Leakage**: Development mock/sample records are **NEVER** copied to production.
3. **Pre-Migration Backups**: Production database backups are executed and verified before any migration or code update is applied.
4. **Git Hygiene**: Production passwords, secrets, `.env.production`, and database backups (`*.sql.gz`) are strictly ignored in `.gitignore`.
