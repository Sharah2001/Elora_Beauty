# Elora Beauty

Elora Beauty is a Next.js application built with TypeScript, React, and
Tailwind CSS. It includes the public salon website, online booking flow,
self-service booking management, and a password-protected staff panel.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Next.js Route Handlers
- JSON file persistence for local development

## Local development

Requirements:

- Node.js 20.9 or newer
- npm

Install and run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Project structure

```text
app/
  api/[...path]/route.ts   Next.js API route handlers
  globals.css              Tailwind CSS and global theme
  layout.tsx               Root layout and metadata
  page.tsx                 Main application page
lib/
  database.ts              Local JSON persistence
public/images/             Static website images
src/
  components/              React UI components
  App.tsx                  Main client application
  types.ts                 Shared TypeScript types
db-store.json              Local development data
```

## Important deployment note

`db-store.json` persistence is suitable for local development or a
single long-running Node.js server. Serverless hosts usually provide an
ephemeral filesystem, so production deployment should replace this file
store with Sanity, PostgreSQL, or another persistent database.

Set a secure `ADMIN_PASSWORD_HASH` value in the deployment environment
before publishing the staff panel.
