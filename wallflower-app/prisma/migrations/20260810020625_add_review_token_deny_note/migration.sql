-- Add reviewToken as nullable, backfill existing rows, then enforce NOT NULL + unique.
ALTER TABLE "Submission" ADD COLUMN "reviewToken" TEXT;
ALTER TABLE "Submission" ADD COLUMN "denyNote" TEXT;

UPDATE "Submission" SET "reviewToken" = gen_random_uuid()::text WHERE "reviewToken" IS NULL;

ALTER TABLE "Submission" ALTER COLUMN "reviewToken" SET NOT NULL;

CREATE UNIQUE INDEX "Submission_reviewToken_key" ON "Submission"("reviewToken");
