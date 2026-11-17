-- DropOldInvites
DELETE FROM "core"."family_invites";

-- DropIndex
DROP INDEX "core"."family_invites_family_id_kind_contact_hash_key";

-- DropIndex
DROP INDEX "core"."family_invites_kind_contact_hash_idx";

-- AlterTable
ALTER TABLE "core"."family_invites" DROP COLUMN "kind",
DROP COLUMN "contact_hash",
DROP COLUMN "hint",
ADD COLUMN     "token_hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "family_invites_token_hash_key" ON "core"."family_invites"("token_hash");

-- CreateIndex
CREATE INDEX "family_invites_family_id_idx" ON "core"."family_invites"("family_id");
