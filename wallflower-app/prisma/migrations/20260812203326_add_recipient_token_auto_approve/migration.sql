-- Add autoApprove, and recipientAccessToken as nullable, backfill existing rows, then enforce NOT NULL + unique.
ALTER TABLE "Event" ADD COLUMN "autoApprove" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN "recipientAccessToken" TEXT;

UPDATE "Event" SET "recipientAccessToken" = gen_random_uuid()::text WHERE "recipientAccessToken" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "recipientAccessToken" SET NOT NULL;

CREATE UNIQUE INDEX "Event_recipientAccessToken_key" ON "Event"("recipientAccessToken");
