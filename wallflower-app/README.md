# Wallflower

Birthday tribute app. Contributors build a flower bouquet, tuck it into a
colored envelope, and write a note; organizers reveal all submissions at
once as a combined garden wall.

This is step 1 of the build: **the bouquet builder + submission form**,
working end-to-end against a real database. No auth, email, or reveal wall
yet — those are steps 2-4.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma (driver adapter: `@prisma/adapter-pg`)

## Setup

1. Start Postgres:

   ```bash
   docker compose up -d
   ```

   (If Docker isn't available in your environment, point `DATABASE_URL` in
   `.env` at any local Postgres 16 instance with a `wallflower` database and
   matching credentials instead.)

2. Copy `.env` and adjust if needed — defaults match `docker-compose.yml`:

   ```
   DATABASE_URL="postgresql://wallflower:wallflower@localhost:5432/wallflower?schema=public"
   ```

3. Run migrations and seed a dev event:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   This creates `/e/laksh-18th`, the contributor link for the seeded event.

4. Start the app:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` (redirects to the seeded event).

## What's implemented

- `GET /e/[slug]` — the builder page for a given event
- `POST /api/events/[slug]/submissions` — create a submission (rejects a
  second submission from the same email for the same event)
- `PATCH /api/events/[slug]/submissions` — edit a submission via its
  `editToken`; resets status to `pending` for re-review
- `GET /api/submissions/[editToken]` — look up a submission by its private
  edit token (used to restore the "Sealed & sent" view on revisit, via a
  token cached in `localStorage` for now — real email delivery of edit
  links is step 3)

## Data model

See `prisma/schema.prisma` — `Organizer`, `Event`, `Submission`, matching
the spec's rough data model.
