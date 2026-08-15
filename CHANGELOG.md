# 📜 Kaksedthan Herdbook - Version Release Log

All notable changes, schema updates, access control enhancements, and production deployment features for Kaksedthan Herdbook are documented in this file.

---

## 🚀 [v0.2.0] - 2026-08-15
### ✨ Added Features & Architecture Enhancements
- **Direct GitHub Production Pipeline**: Created `deployment/production/deploy-from-github.sh` and `"deploy:github"` script for 1-command GitHub pull & deployment.
- **Enhanced Master Data Setup**: Complete DDL support for `breed_configurations`, `farms`, `breeders`, and `sourcing_companies`.
- **Database Relational Parity**: Extended schema columns across `users`, `farms`, `breeders`, `calves`, `sires`, `dams`, `breeding_programs`, and `herdbook_registrations`.
- **Non-Destructive Migration Pipeline**: `safe-migrate.ts` executes DDL statements with lock-free non-blocking queries.

---

## 📦 [v0.1.0] - 2026-08-10
### 🛡️ Initial System Launch
- **Access Control V2 System**: Role-Based Access Control (RBAC), User Level module access matrix (`user_level_modules`), and 44 granular permissions.
- **Cattle & Herd Management**: Sire, Dam, Calf, Birth Certificate, Pedigree Register, and Breeding Program modules.
- **Production Infrastructure**: DigitalOcean droplet deployment with PM2, PostgreSQL 16 (`livestock_db`), and Nginx reverse proxy with SSL (`https://livestock.kaksedthan.com`).
