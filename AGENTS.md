<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 📘 MANDATORY AI & DEVELOPER ARCHITECTURE RULES

Before writing or modifying any code, database migration, API route, or deployment script in this codebase, **YOU MUST READ AND FOLLOW**:

👉 **[`OFFICIAL_DEVELOPMENT_AND_DEPLOYMENT_GUIDE.md`](./OFFICIAL_DEVELOPMENT_AND_DEPLOYMENT_GUIDE.md)**

### Key Directives:
1. **Environment Separation**: Localhost development (`kaksedthan_herdbook` on port 5433) and Production (`livestock_db` on port 5432) must NEVER share database or storage directories.
2. **No Hardcoded Business Data**: Business data must flow via **Frontend $\rightarrow$ API $\rightarrow$ Database**. Never hardcode cattle, customer, or transaction arrays in production code.
3. **Database Change Rules**: All schema structural changes MUST be made via migration scripts in `src/db/migrations/`.
4. **Mandatory Production Backup Guard**: Production deployments (`npm run deploy:prod`) MUST run and verify database backups before applying migrations.
5. **No Data Overwriting**: Production records MUST NEVER be truncated, dropped, or seeded with development data.
