-- recipientAccessToken previously relied on Prisma generating its cuid()
-- value client-side before insert. That's fragile across driver-adapter /
-- connection-pooling setups (observed producing NULL in production,
-- violating the NOT NULL constraint) — give it a real database-level
-- default so Postgres always supplies a value regardless of the client.
ALTER TABLE "Event" ALTER COLUMN "recipientAccessToken" SET DEFAULT gen_random_uuid();
