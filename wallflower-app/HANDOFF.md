# Handoff — Wallflower Birthday Tribute App

## What this project is

A birthday tribute app. Full product spec, chat transcripts, and the
original Claude Design handoff bundle are in the repo root (`README.md`,
`chats/`, `project/`) — read those first if anything below is unclear.
`project/Wallflower Envelope Mobile.dc.html` is the design source of truth
for visual details (colors, fonts, layout, animation).

Build priority, as given by the user:
1. Bouquet builder + submission form, working end-to-end — **done**
2. Organizer magic-link auth + dashboard + approve/deny — **done**
3. Email notifications (submission confirmation, review request,
   deny-with-note, edit link) — **done**
4. Reveal mechanics (countdown/teaser page, manual + auto-trigger, live
   reveal wall) — **not started, next up**

The user also wants the app **deployed to Vercel** with a hosted
Postgres, purely so they can preview it in a browser without local setup.
Not started — see "Vercel deploy" below.

## Stack (already decided and built — don't re-litigate)

- Next.js 16 (App Router) + TypeScript + Tailwind, in `wallflower-app/`
- PostgreSQL + Prisma 7, driver adapter `@prisma/adapter-pg` (Prisma 7
  moved datasource config out of `schema.prisma` into `prisma.config.ts`
  — read that file before touching migrations, it's not the API you
  remember)
- Auth: hand-rolled magic-link + session-cookie (no NextAuth/Clerk/etc.)
  — see `src/lib/wallflower/auth.ts`
- Email: `src/lib/wallflower/email.ts` — `sendEmail()` logs to the server
  console (prefixed `[wallflower:email]`) unless `RESEND_API_KEY` is set,
  in which case it actually sends via Resend's REST API. No provider has
  been configured in any environment this has run in yet, so every email
  sent so far is dev-console-only — verify by tailing server output, not
  an inbox. `EMAIL_FROM` and `APP_URL` are the other relevant env vars
  (see `getBaseUrl()` in that file for the URL-building fallback chain)
- Decision logic (`applySubmissionDecision` in
  `src/lib/wallflower/decision.ts`) is shared between the dashboard queue
  (`/organizer/events/[eventId]`, session-authed) and the one-tap email
  link (`/review/[reviewToken]`, token-authed, no login) — keep it that
  way rather than duplicating approve/deny logic if you touch either

**Read `wallflower-app/AGENTS.md` before writing any Next.js code** — this
app is on Next.js 16, which has real breaking changes vs. older training
data (async `params`/`cookies()`, Server Actions via `'use server'`,
Turbopack by default, `cacheComponents` off by default so no `"use cache"`
needed). Docs are bundled at `wallflower-app/node_modules/next/dist/docs/`.

## Local dev (works, verified repeatedly with Playwright)

```bash
cd wallflower-app
npm install
# Postgres: docker compose up -d (or point DATABASE_URL in .env at any local Postgres 16)
npx prisma migrate dev
npx prisma db seed        # creates /e/laksh-18th
npm run dev
```

If `.env` is missing (it's gitignored on purpose, so a fresh clone won't
have it), recreate it:
```
DATABASE_URL="postgresql://wallflower:wallflower@localhost:5432/wallflower?schema=public"
```
Next.js only reads `.env` at process startup — if you create/edit it
while `next dev` is already running, restart the dev server.

## GitHub

Push access works (`git push origin main` succeeds, verified via `git
ls-remote origin`). One thing to know: **the repo's default branch on
GitHub is currently `test-push-access`**, a throwaway single-commit
branch from an earlier permission test — not `main`, where all the real
code is. A plain `git clone` checks out the default, which lands in an
empty directory and confuses people. Fix it once with:
```
gh repo edit vidhi0106/wallflower --default-branch main
```
(and optionally delete the stray branch) rather than re-explaining the
workaround every time.

## Vercel deploy (not started)

Prep already done in the codebase:
- `package.json` has a `vercel-build` script
  (`prisma migrate deploy && next build`) — Vercel auto-detects and runs
  this instead of `build` if present, so migrations apply on every deploy
- `postinstall` runs `prisma generate`

`api.vercel.com` was network-blocked in every session so far — check
first with `curl https://api.vercel.com/v2/user` (needs a token) before
assuming the CLI works; if it's still blocked, the dashboard-import path
(user connects the GitHub repo directly at vercel.com, root directory
`wallflower-app`) works around it without needing API access from here.

Steps once either path is viable:
1. Get a Vercel token from the user if driving via CLI, or have them
   import `vidhi0106/wallflower` in the dashboard with root directory set
   to `wallflower-app`
2. Add a Postgres database to the project (**Storage → Create Database →
   Postgres**, one click)
3. Confirm a `DATABASE_URL` env var exists pointing at a **pooled**
   connection string (name Vercel's integration uses varies by product
   version — check what actually got injected, alias if needed)
4. Deploy — `vercel-build` handles migrations automatically
5. Seed once: pull the prod `DATABASE_URL` and run `DATABASE_URL=<prod>
   npx tsx prisma/seed.ts` locally (no seed-on-deploy hook by design —
   seeding is a dev convenience, not production behavior)
6. If real emails are wanted at this point, add `RESEND_API_KEY` and
   `EMAIL_FROM` env vars on the Vercel project — no code changes needed,
   `sendEmail()` already branches on `RESEND_API_KEY`'s presence

## Testing approach used so far (recommend continuing it)

No test suite — verification was done manually via Playwright driving the
real dev server (Chromium at `/opt/pw-browsers/chromium`,
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), checking screenshots, server
logs (for email content), and DB state directly with `psql`. `tsc
--noEmit`, `eslint .`, and `next build` were run clean before calling any
task done. Keep doing this — the user can't easily run the app themselves
to check UI work.

Note: `next build` kills a concurrently-running `next dev` (Next 16's
lockfile mechanism), and background processes can get reclaimed by the
sandbox — if `curl localhost:3000` fails, just restart the dev server. If
Postgres isn't responding, `service postgresql start` (this sandbox runs
it natively rather than via `docker-compose.yml`, since Docker Hub pulls
are also blocked here — both approaches work, `docker-compose.yml` is
still in the repo for normal environments).
