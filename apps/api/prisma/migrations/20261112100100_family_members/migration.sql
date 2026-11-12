-- Backfill
UPDATE "core"."memberships" SET "role" = 'owner';

-- CreateEnum
CREATE TYPE "core"."contact_kind" AS ENUM ('email', 'phone');

-- CreateTable
CREATE TABLE "core"."user_contacts" (
    "kind" "core"."contact_kind" NOT NULL,
    "hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_contacts_pkey" PRIMARY KEY ("kind","hash")
);

-- CreateTable
CREATE TABLE "core"."family_invites" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "kind" "core"."contact_kind" NOT NULL,
    "contact_hash" TEXT NOT NULL,
    "hint" VARCHAR(60) NOT NULL,
    "invited_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "family_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."join_requests" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_key" ON "core"."memberships"("user_id");

-- CreateIndex
CREATE INDEX "user_contacts_user_id_idx" ON "core"."user_contacts"("user_id");

-- CreateIndex
CREATE INDEX "family_invites_kind_contact_hash_idx" ON "core"."family_invites"("kind", "contact_hash");

-- CreateIndex
CREATE UNIQUE INDEX "family_invites_family_id_kind_contact_hash_key" ON "core"."family_invites"("family_id", "kind", "contact_hash");

-- CreateIndex
CREATE INDEX "join_requests_user_id_idx" ON "core"."join_requests"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "join_requests_family_id_user_id_key" ON "core"."join_requests"("family_id", "user_id");

-- AddForeignKey
ALTER TABLE "core"."user_contacts" ADD CONSTRAINT "user_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."family_invites" ADD CONSTRAINT "family_invites_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."family_invites" ADD CONSTRAINT "family_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."join_requests" ADD CONSTRAINT "join_requests_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."join_requests" ADD CONSTRAINT "join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
