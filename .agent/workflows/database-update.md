---
description: Workflow for updating database schema and generating clients
---

1. **Schema Modification**
   - Edit the Drizzle schema file (usually `schema.ts` or similar in `db` folder).

2. **Generate & Migrate**
   // turbo
   - Run `pnpm db:generate` to generate SQL migrations.
     // turbo
   - Run `pnpm db:migrate` to apply migrations (or `pnpm db:migrate:run` for custom script).

3. **Seed (Optional)**
   - If needed, run `pnpm db:seed` to seed the database.
