# 📘 OFFICIAL TECHNICAL REFERENCE & DEPLOYMENT ARCHITECTURE
## Kaksethan Livestock & Herdbook Management System
**Version:** 1.0.0 | **Last Updated:** August 2026

> [!IMPORTANT]
> **MANDATORY FOR ALL DEVELOPERS & AI AGENTS:**
> This document is the single authoritative technical reference governing Frontend, Backend, API, Database Schema, Database Migrations, Environment Configurations, and Production Deployments.
> All human developers and AI coding agents MUST read and strictly adhere to the guidelines in this document BEFORE making any code edits, database schema updates, or production deployments.

---

## 1. Environment Architecture

The system enforces total isolation between **Development (Localhost)** and **Production** environments.

```text
                                 ┌─────────────────────────────────────────┐
                                 │     KAKSETHAN SINGLE CODEBASE REPO      │
                                 └────────────────────┬────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         🛠️  DEVELOPMENT (Localhost)                                  🚀 PRODUCTION (livestock.kaksedthan.com)
  ┌────────────────────────────────────────┐                   ┌────────────────────────────────────────┐
  │ Env File:   .env.development           │                   │ Env File:   .env.production (Server) │
  │ DB Host:    localhost:5433 (Docker)    │                   │ DB Host:    127.0.0.1:5432 (PostgreSQL)│
  │ DB Name:    kaksedthan_herdbook        │                   │ DB Name:    livestock_db             │
  │ Storage:    public/uploads/dev/        │                   │ Storage:    public/uploads/prod/     │
  │ API URL:    http://localhost:5001/api/v1│                   │ API URL:    /api/v1 (Nginx Proxy)    │
  │ Test Data:  Allowed (dev-seed.ts)      │                   │ Test Data:  FORBIDDEN (Real Data Only) │
  └────────────────────────────────────────┘                   └────────────────────────────────────────┘
```

> [!CAUTION]
> **STRICT ISOLATION RULE:** Development and Production environments MUST NEVER share the same database or storage directories.

---

## 2. Source of Truth Matrix

To prevent data drift and architectural conflicts, every technical domain has one single designated Source of Truth:

| Technical Domain | Single Source of Truth | Location / Reference |
| :--- | :--- | :--- |
| **UI Components & Layout** | Frontend Codebase | `src/app/`, `src/components/` |
| **Business Logic & Rules** | Backend / Service Layer | `src/server/`, `src/repositories/` |
| **Dynamic Business Data** | Environment Database | Localhost DB vs Production DB |
| **Data Access & Protocols** | REST API Layer | `src/lib/api/`, `/api/v1/` Endpoints |
| **Database Schema Structure** | Migration DDL Files | `src/db/migrations/` |
| **Environment Configuration** | Environment Variables | `.env.development` vs `.env.production` |
| **Production Business Data** | Production PostgreSQL | Server `livestock_db` Database |
| **Uploaded Media & Images** | Storage Directories | `public/uploads/dev/` vs `public/uploads/prod/` |

---

## 3. Database Change Rules

All database schema structural modifications **MUST** be executed through controlled migration scripts in `src/db/migrations/`.

### 🚫 STRICTLY FORBIDDEN ACTIONS:
* **NO Manual DB Modifications**: Never alter production database tables manually via psql without a reviewed migration file.
* **NO Production Data Resets**: Never drop, truncate, or reset production tables during normal deployment.
* **NO Unsafe Column Deletions**: Never delete existing production columns or tables without prior impact analysis and data migration.
* **NO Destructive Type Changes**: Never alter column data types without checking existing production records.
* **NO Duplicate Entity Tables**: Never create a duplicate table (e.g. `cows_new`) simply because an existing table is difficult to modify.

---

## 4. Code & Database Compatibility Flow

Before creating or altering any database table or field, developers must trace the full request pipeline:

$$\text{Frontend UI} \longrightarrow \text{API Contract} \longrightarrow \text{Backend Repository} \longrightarrow \text{Database Schema}$$

### Verification Checklist before Schema Modifications:
1. Identify all affected API endpoints in `src/lib/api/` and `src/server/routes/`.
2. Inspect request/response payloads in TypeScript interfaces (`src/types/`).
3. Audit frontend form components, detail views, and reports consuming the fields.
4. Verify foreign key constraints and cascade rules across related tables.
5. Check existing production records for non-null requirements or default values.

---

## 5. API Contract Guidelines

API endpoints are strict contracts between client and server.

### API Modification Lifecycle:
1. **Consumer Audit**: Identify all frontend components consuming the endpoint.
2. **Backward Compatibility**: Ensure non-breaking changes (e.g. add optional response properties; never delete required fields without a deprecation phase).
3. **Backend Update**: Implement logic in server route handler and repository.
4. **Frontend Update**: Update UI components and API client services (`src/lib/api/`).
5. **Local Validation**: Verify end-to-end flow on local development environment.
6. **Production Deploy**: Deploy backward-compatible changes to production.

---

## 6. Migration Execution Rules

* **Deterministic Ordering**: Every migration script must have a clear version timestamp or numerical sequence.
* **Source Control**: All migration scripts MUST be committed to Git.
* **Local Test Execution**: Migrations must be run and verified against `kaksedthan_herdbook` before pushing.
* **Non-Destructive DDL**: Use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, and explicit guards.
* **No Database Dumps**: Never use database dumps as a substitute for migration files.

---

## 7. Production Data Protection & Mandatory Backup

Production data represents real business operations and must be protected against corruption or accidental loss.

### 🛡️ Pre-Deployment Execution Chain:
$$\text{Production Backup} \longrightarrow \text{Verify Backup File} \longrightarrow \text{Schema Migration} \longrightarrow \text{Verify DB Health} \longrightarrow \text{Deploy App} \longrightarrow \text{Smoke Test}$$

> [!WARNING]
> If any step in the pipeline fails (e.g., backup failure or migration error), **THE DEPLOYMENT PIPELINE ABORTS IMMEDIATELY**.

---

## 8. Test Data, Seeds & Master Reference Data

* **Development Test Data (`src/db/seeds/dev-seed.ts`)**: Sample cattle, mock transactions, and dev accounts. **ONLY ALLOWED ON LOCALHOST.** Aborts automatically if `NODE_ENV=production`.
* **Master System Data (`seed-breed-configs.ts`, `seed-system-data.ts`)**: Reference breed standards, default user level definitions, and permission matrices required for application operation.
* **Production Data**: Real customer, farm, cattle, and transaction records created by actual system users.

---

## 9. Environment Variables Reference

All application secrets and environment configurations are managed via environment variables.

| Variable Name | Description | Development Example | Production Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application Mode | `development` | `production` |
| `PORT` | Next.js Frontend Port | `3000` | `3000` |
| `API_PORT` | Express Backend Port | `5001` | `3002` |
| `NEXT_PUBLIC_API_URL` | Client API Base Endpoint | `http://localhost:5001/api/v1` | `/api/v1` |
| `DB_HOST` | PostgreSQL Host | `localhost` | `127.0.0.1` |
| `DB_PORT` | PostgreSQL Port | `5433` (Docker) | `5432` (System Service) |
| `DB_USER` | PostgreSQL User | `postgres` | `postgres` |
| `DB_PASSWORD` | PostgreSQL Password | `postgres123` | `[SECURE_SERVER_SECRET]` |
| `DB_NAME` | Database Name | `kaksedthan_herdbook` | `livestock_db` |
| `UPLOAD_DIR` | Storage Subdirectory | `uploads/dev` | `uploads/prod` |
| `JWT_SECRET` | JWT Signing Key | `dev-jwt-secret` | `[SECURE_RANDOM_KEY]` |
| `SESSION_SECRET` | Cookie Session Secret | `dev-session-secret` | `[SECURE_RANDOM_KEY]` |

---

## 10. Official 9-Step Deployment Pipeline

Production deployment is executed via `npm run deploy:prod` (`deployment/production/deploy.sh`):

1. **Step 1: Environment & Secrets Verification**: Validates production env vars (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
2. **Step 2: Database Connectivity Check**: Tests connection to `livestock_db`.
3. **Step 3: Automated Database Backup**: Creates compressed dump in `backups/prod_backup_YYYYMMDD_HHMMSS.sql.gz`. Verifies file exists and is non-empty.
4. **Step 4: Schema Migrations**: Runs schema DDL migrations (`safe-migrate.ts`).
5. **Step 5: Production Build Compilation**: Compiles Next.js bundle (`NODE_OPTIONS="--max-old-space-size=2048" npm run build`).
6. **Step 6: PM2 Service Reload**: Reloads PM2 processes (`pm2 reload all`).
7. **Step 7: Endpoint Verification**: Checks `HTTP 200 OK` on UI (`:3000`) and API (`:3002`).
8. **Step 8: Log Monitoring**: Inspects error logs for runtime issues.
9. **Step 9: Release Tagging**: Records release version in git log.

---

## 11. Application & Database Compatibility Matrix

Application code and database schema versions must remain aligned:

| App Version | Database Schema Version | Compatible Migrations | Notes |
| :--- | :--- | :--- | :--- |
| `v0.1.0` | `schema_v1` | `safe-migrate.ts`, `add-level-type-to-user-levels.ts` | Initial Livestock & Access Control V2 release |

---

## 12. Breaking Changes Migration Strategy

When modifying high-impact production fields, follow the **5-Stage Safe Migration Pattern**:

$$\text{1. Add New Field} \longrightarrow \text{2. Support Dual Writing} \longrightarrow \text{3. Migrate Data} \longrightarrow \text{4. Switch Readers} \longrightarrow \text{5. Deprecate Old Field}$$

### Example: Renaming `owner_name` $\rightarrow$ `customer_id`
1. **Add**: Add `customer_id VARCHAR(50)` column to `stock` table (keep `owner_name`).
2. **Support**: Update API repository to populate both `owner_name` and `customer_id`.
3. **Migrate**: Run data backfill script linking existing `owner_name` values to customer IDs.
4. **Switch**: Update frontend UI to display customer details via `customer_id`.
5. **Deprecate**: Drop `owner_name` column only after zero application code relies on it.

---

## 13. Feature Development Checklist

For every new feature request, developers MUST complete the following:

- [ ] **UI Components**: Build responsive, fluid UI in `src/app/` or `src/components/`.
- [ ] **API Endpoint**: Define REST handler in `src/server/routes/` or server action in `src/app/actions.ts`.
- [ ] **Business Logic**: Enforce authorization and validation rules in backend service layer.
- [ ] **Database Schema**: Write non-destructive DDL migration script in `src/db/migrations/`.
- [ ] **Access Control**: Update user levels and permission matrices (`src/lib/auth/accessControl.ts`).
- [ ] **Empty States**: Display user-friendly empty placeholders ("Information not available") when no data exists.
- [ ] **Local Testing**: Verify full flow against localhost DB (`kaksedthan_herdbook`).

---

## 14. Prohibition of Hardcoded Business Data

> [!CAUTION]
> **NO HARDCODED MOCK RECORDS IN PRODUCTION CODE:**
> Source code must NEVER contain hardcoded business data arrays (cows, farms, customers, certificates, sales transactions).
> All business data MUST flow through **Database $\rightarrow$ API $\rightarrow$ Frontend UI**. If no records exist in the database, the UI MUST render an appropriate empty state.

---

## 15. Existing Production Data Impact Assessment

Before executing any schema update on production, perform an **Impact Assessment**:
1. **Record Count**: Query total rows affected (`SELECT COUNT(*) FROM target_table`).
2. **Dependent Tables**: Search for foreign keys pointing to the table.
3. **API Dependency**: Search codebase for queries selecting from the table.
4. **Data Backfill Plan**: Ensure existing null values are populated with valid defaults.
5. **Rollback Plan**: Verify that a database backup exists and rollback commands are ready.

---

## 16. Automated Backup & Rollback Recovery Procedure

If a production deployment encounters a critical failure after database migration:

### ⏪ Emergency Rollback Steps:
1. **Stop Application Services**:
   ```bash
   pm2 stop all
   ```
2. **Locate Latest Verified Backup File**:
   ```bash
   ls -la /root/LiveStock/backups/prod_backup_*.sql.gz | tail -n 1
   ```
3. **Restore Production Database**:
   ```bash
   gunzip -c /root/LiveStock/backups/prod_backup_YYYYMMDD_HHMMSS.sql.gz | psql -h 127.0.0.1 -U postgres -d livestock_db
   ```
4. **Revert Application Code to Previous Stable Commit**:
   ```bash
   git reset --hard HEAD~1
   ```
5. **Rebuild & Restart Services**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=2048" npm run build
   pm2 start ecosystem.config.js --update-env
   ```

---

## 17. Documentation Maintenance Protocol

This document must be updated whenever any of the following events occur:
* Addition of new database tables or relationships.
* Modifications to environment variable structures.
* Architectural changes to Next.js or Express server APIs.
* Updates to deployment pipelines or server infrastructure.

---

## 18. Standard Change Record Template

For all major production releases or schema migrations, record details in the format below:

```text
Change ID:            CR-20260815-01
Feature / Description: Implement Access Control V2 and Environment Separation
Developer / Author:    Lead Architect / Antigravity Agent
Date:                 2026-08-15
Application Version:  v0.1.0
Database Migration:   safe-migrate.ts, add-level-type-to-user-levels.ts
API Endpoints:        /api/v1/user-levels, /api/v1/permissions, /api/v1/roles
Affected Modules:     User Management, Access Control, Stock Management
Production Data:      70 cattle stock, 100 weight logs, 106 expenses preserved 100%
Testing Status:       PASSED (Localhost & Production Smoke Tests)
Deployment Status:    SUCCESS (PM2 Services Active)
Rollback Plan:        /root/LiveStock/backups/prod_backup_20260815_041858.sql.gz
```

---

## 19. Final Pre-Deployment Verification Checklist

Before initiating production deployment, verify all 15 checklist items:

- [x] **1. DB Isolation**: Development (`kaksedthan_herdbook`) and Production (`livestock_db`) are separate.
- [x] **2. Env Isolation**: Localhost uses `.env.development`; Production uses `.env.production`.
- [x] **3. URL Verification**: No `localhost:5001` or `127.0.0.1` hardcoded in production frontend builds.
- [x] **4. Secret Security**: No production passwords or tokens committed to Git repository.
- [x] **5. No Data Leakage**: Development mock/sample records excluded from production build.
- [x] **6. DDL Migrations**: Database structural changes have dedicated migration files in `src/db/migrations/`.
- [x] **7. Migration Testing**: Migration scripts tested and verified against local database.
- [x] **8. Impact Assessment**: Production data impact reviewed for affected tables.
- [x] **9. Automated Backup**: Pre-deployment backup script configured in `deployment/production/backup.sh`.
- [x] **10. Backup Verification**: Backup script verifies output file size before allowing migrations.
- [x] **11. Schema Compatibility**: Application code and database schema versions verified for compatibility.
- [x] **12. API Testing**: All REST endpoints and server actions tested.
- [x] **13. UI Testing**: Frontend forms, tables, detail views, and empty states tested.
- [x] **14. Rollback Recovery**: Automated rollback procedure documented and verified.
- [x] **15. Smoke Test**: HTTP 200 OK verified on live application URL (`https://livestock.kaksedthan.com`).

---

## 20. Mandatory Instructions for Future AI Coding Agents

> [!IMPORTANT]
> **READ BEFORE GENERATING OR MODIFYING CODE:**
> Any AI agent working on this codebase MUST read this document (`OFFICIAL_DEVELOPMENT_AND_DEPLOYMENT_GUIDE.md`) before creating files or altering code.

### Rules for AI Agents:
1. **Analyze Existing Architecture First**: Never invent duplicate tables, duplicate APIs, or conflicting data structures. Inspect `src/db/migrations/` and `src/repositories/` first.
2. **Never Hardcode Mock Business Data**: Never return hardcoded arrays of cattle, farms, or customers in production code paths. Always query the database through the API layer.
3. **Never Bypass Migrations**: Never modify database schema directly or create ad-hoc SQL files outside `src/db/migrations/`.
4. **Never Overwrite Production Records**: Always use safe non-destructive queries (`IF NOT EXISTS`, `ON CONFLICT DO UPDATE`).
5. **Never Assume DB is Empty**: Always design migrations to support existing production records.
6. **Follow 7-Step AI Workflow**:
$$\text{Architecture Inspection} \rightarrow \text{Impact Analysis} \rightarrow \text{Code Implementation} \rightarrow \text{DDL Migration} \rightarrow \text{Local Testing} \rightarrow \text{Documentation Update} \rightarrow \text{Deployment}$$
