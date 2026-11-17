-- AlterTable
ALTER TABLE "core"."users" ADD COLUMN "pin_hash" JSONB;

-- Every adult keeps the family PIN they already know until they choose their own
UPDATE "core"."users" AS u
SET "pin_hash" = r."data" -> 'pinHash'
FROM "core"."memberships" AS m
JOIN "core"."records" AS r
  ON r."family_id" = m."family_id" AND r."kind" = 'settings' AND r."deleted_at" IS NULL
WHERE m."user_id" = u."id"
  AND u."pin_hash" IS NULL
  AND jsonb_typeof(r."data" -> 'pinHash') = 'object';
