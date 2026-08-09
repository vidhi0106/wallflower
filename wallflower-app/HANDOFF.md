# Handoff — Wallflower Birthday Tribute App

_Written at the end of a prior session that hit two environment-level
blockers (see "Known blockers" below) and could not push to GitHub or
reach the Vercel API. Picking up here._

## What this project is

A birthday tribute app. Full product spec, chat transcripts, and the
original Claude Design handoff bundle are in the repo root (`README.md`,
`chats/`, `project/`) — read those first if anything below is unclear.
`project/Wallflower Envelope Mobile.dc.html` is the design source of truth
for visual details (colors, fonts, layout, animation).

Build priority, as given by the user:
1. Bouquet builder + submission form, working end-to-end — **done**
2. Organizer magic-link auth + dashboard + approve/deny (no email yet) — **done**
3. Email notifications (submission confirmation, approval request,
   deny-with-note, edit link) — **not started**
4. Reveal mechanics (countdown/teaser page, manual + auto-trigger, live
   reveal wall) — **not started**

The user has also now asked to get the app **deployed to Vercel** with a
hosted Postgres, purely so they can preview it in a browser without local
setup. That's the immediate next task, ahead of steps 3/4.

## Stack (already decided and built — don't re-litigate)

- Next.js 16 (App Router) + TypeScript + Tailwind, in `wallflower-app/`
- PostgreSQL + Prisma 7, driver adapter `@prisma/adapter-pg` (Prisma 7
  moved datasource config out of `schema.prisma` into `prisma.config.ts`
  — read that file before touching migrations, it's not the API you
  remember)
- Auth: hand-rolled magic-link + session-cookie (no NextAuth/Clerk/etc.)
  — see `src/lib/wallflower/auth.ts`
- No email service wired up yet — magic links are shown directly on
  `/login` and logged server-side instead

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

Note: in the prior session's sandbox, Docker Hub pulls were blocked by
network policy, so Postgres was run natively (`apt`-installed
`postgresql-16`, `service postgresql start`) instead of via
`docker-compose.yml`. Both work; `docker-compose.yml` is left in the repo
for normal environments. Also: **the dev server and Postgres both get
killed when the sandbox reclaims idle background processes**, and running
`next build` also kills a concurrently-running `next dev` (Next 16's
lockfile mechanism) — if `curl localhost:3000` fails, just restart
whichever died.

## What's left to do for the Vercel deploy

Not started yet — network access to `api.vercel.com` was blocked in the
prior session (fixed now, per the user, hence the fresh session). A
Vercel API token was already provided by the user in that session's chat
but never used successfully — **ask the user for it again** rather than
assuming it's still valid or available to you; don't invent one.

Prep already done in the codebase to make this smooth:
- `package.json` has a `vercel-build` script
  (`prisma migrate deploy && next build`) — Vercel auto-detects and runs
  this instead of `build` if present, so migrations apply on every deploy
- `postinstall` runs `prisma generate`

Steps:
1. Get a fresh Vercel token from the user (`vercel.com/account/tokens`),
   or confirm the previously-shared one still works: `curl -H
   "Authorization: Bearer $TOKEN" https://api.vercel.com/v2/user`
2. `npx vercel link --token $TOKEN --yes` from `wallflower-app/` to create
   the project (non-interactive)
3. Add a Postgres database to the project. The Vercel CLI doesn't
   reliably provision storage non-interactively — check current CLI
   capabilities first (`npx vercel storage --help` or similar), but the
   fallback is asking the user to click **Storage → Create Database →
   Postgres (Neon)** in the Vercel dashboard for this project (one click,
   same account, no separate signup)
4. Whatever env var name Vercel's Postgres integration injects
   (historically `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, or `DATABASE_URL`
   depending on product version — check what actually shows up), make
   sure a `DATABASE_URL` env var exists on the Vercel project pointing at
   a **pooled** connection string (`npx vercel env add DATABASE_URL
   production --token $TOKEN` if it needs to be added/aliased manually)
5. `npx vercel deploy --prod --token $TOKEN --yes`
6. Seed the deployed database once: pull the prod `DATABASE_URL` (`npx
   vercel env pull --token $TOKEN`) and run `DATABASE_URL=<prod-url> npx
   tsx prisma/seed.ts` locally, or add a one-off script — the app has no
   seed-on-deploy hook by design (seeding is a dev convenience, not
   production behavior)
7. Give the user the resulting `*.vercel.app` URL

## Known blockers hit in the prior session (context, not necessarily still true)

- **GitHub push denied**: `git push` to `vidhi0106/wallflower` returned
  403 with body `Permission to vidhi0106/wallflower.git denied to
  vidhi0106`, even though `list_repos`/`add_repo` reported push access
  granted. Root cause turned out to be that the Claude GitHub App
  integration wasn't actually installed on the user's GitHub account
  (confirmed via github.com → Settings → Applications → Installed GitHub
  Apps, which showed only Netlify). The user reconnected GitHub via
  claude.ai → Settings → Connectors → GitHub Integration, but the fix
  didn't take effect in the already-running session — hence starting
  fresh. **Retry the push early in this session**; if it's still denied,
  walk the user through the same GitHub Settings → Applications check
  again rather than assuming the reconnect didn't work.
- **`api.vercel.com` network-blocked**: the sandbox's network access
  level was **Trusted** (allowlist only — npm/GitHub/Docker Hub/etc, not
  Vercel). The user changed it to Full/Custom via the environment's
  network access setting on claude.ai/code, but again it didn't apply
  mid-session. Should be fixed in a fresh session; verify with a plain
  `curl https://api.vercel.com/v2/user` before assuming the CLI works.
- Neither of these is a code problem — don't touch app code trying to
  route around them.

## Where the code actually lives

This was pushed to GitHub as the very first action of this new session
(see the commit at the top of `git log`) — if for some reason that didn't
happen, the full source was also sent to the user twice as
`wallflower-app.tar.gz` (excludes `node_modules`, `.next`, `.env`). Do not
reconstruct the app from scratch; recover it from one of those two
places.

## Testing approach used so far (recommend continuing it)

No test suite — verification was done manually via Playwright driving the
real dev server (Chromium at `/opt/pw-browsers/chromium`,
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), checking screenshots and DB
state directly with `psql`. `tsc --noEmit`, `eslint .`, and `next build`
were run clean before calling any task done. Keep doing this — the user
can't easily run the app themselves to check UI work.
