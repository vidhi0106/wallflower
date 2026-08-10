# Wallflower

Birthday tribute app. Contributors build a flower bouquet, tuck it into a
colored envelope, and write a note; organizers reveal all submissions at
once as a combined garden wall.

Steps 1-3 of the build are done: **the bouquet builder + submission form**,
**organizer magic-link auth + dashboard + approve/deny queue**, and
**email notifications** (confirmation, review request, deny-with-note),
all working end-to-end against a real database. No reveal wall yet — see
`HANDOFF.md` for exact status and next steps.

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

**Contributor side (step 1)**
- `GET /e/[slug]` — the builder page for a given event
- `POST /api/events/[slug]/submissions` — create a submission (rejects a
  second submission from the same email for the same event)
- `PATCH /api/events/[slug]/submissions` — edit a submission via its
  `editToken`; resets status to `pending` for re-review
- `GET /api/submissions/[editToken]` — look up a submission by its private
  edit token (used to restore the "Sealed & sent" view — token is cached
  in `localStorage`, but also readable from a `?edit=TOKEN` URL param so
  the private edit link sent by email works from any device)

**Organizer side (step 2)**
- `/login` — passwordless magic-link sign-in
- `GET /api/auth/verify` — consumes the magic-link token, creates the
  organizer on first login, starts a session (httpOnly cookie)
- `/organizer` — dashboard: the organizer's events + create-event form
- `/organizer/events/[eventId]` — review queue (pending/approved/denied)
  with Approve/Deny actions (deny takes an optional note), ownership-
  checked server-side

**Email (step 3)**
- `src/lib/wallflower/email.ts` — `sendEmail()` logs to the server console
  when `RESEND_API_KEY` isn't set (true in every environment this has run
  in so far), or sends via Resend's API when it is. Templates: magic
  link, submission confirmation, review request, deny notice
- `/review/[reviewToken]` — the "one-tap" link organizers get emailed per
  submission: approve or deny (with a note) without logging in. Sits
  alongside the dashboard queue, not instead of it — both call the same
  `applySubmissionDecision()` in `src/lib/wallflower/decision.ts`
- A denied submission's edit page shows the organizer's note and lets the
  contributor revise and resend, which re-notifies the organizer

## Data model

See `prisma/schema.prisma` — `Organizer`, `Event`, `Submission` (now with
`reviewToken` and `denyNote`), `MagicLink`, `Session`.

## Deploying

See `HANDOFF.md` for exact status, what's left to wire up for a Vercel
deploy, and what to build next.
