# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Back-end** — run from `back-end/`:

```bash
npm start              # Start the server (port 3000)
npx prisma migrate dev # Run pending database migrations
npx prisma studio      # Open Prisma GUI to inspect database
npx prisma generate    # Regenerate Prisma Client after schema changes
```

**Front-end** — run from `front-end/`:

```bash
npm run dev    # Start Vite dev server
npm run build  # Production build
npm run lint   # ESLint
```

There are no automated tests configured in either package.

## Architecture

The repo has two independent packages: `back-end/` (Node.js REST API) and `front-end/` (React SPA, still being scaffolded).

### Back-end layers

- **`server.js`** — Express entry point: JSON middleware, Swagger UI at `/api-docs`, routes mounted at `/usuarios`
- **`src/routes/userRoutes.js`** — Express Router with 5 endpoints; all Swagger JSDoc annotations live here
- **`src/controllers/userController.js`** — Business logic: Zod validation → Prisma queries → HTTP responses; Prisma adapter and client are module-level singletons here
- **`src/swagger.js`** — swagger-jsdoc + swagger-ui-express configuration
- **`prisma/schema.prisma`** — Single `User` model (id, nome, idade, email, createdAt)
- **`prisma.config.ts`** — Prisma CLI configuration (schema path, migrations path, datasource URL from env)

### Front-end

React 19 + Vite + Tailwind CSS v4 (`@tailwindcss/vite` plugin). The app is scaffolded but not yet implemented.

## Key conventions

- **ES Modules**: `"type": "module"` in both `package.json` files — use `import/export`, not `require`
- **Prisma with driver adapter**: Uses `@prisma/adapter-pg` (PrismaPg) instead of the default Prisma engine; configured via `prisma.config.ts`
- **Validation**: Zod schema defined in `userController.js` runs before every create/update; all fields (nome, idade, email) are required
- **Error handling**: Prisma `P2002` → 409 (duplicate email), `P2025` → 404 (not found); Zod errors → 400
- **Database**: PostgreSQL; connection string via `DATABASE_URL` in `back-end/.env` (see `.env.example` for format)
