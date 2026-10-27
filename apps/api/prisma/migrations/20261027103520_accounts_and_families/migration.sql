-- CreateEnum
CREATE TYPE "core"."membership_role" AS ENUM ('parent');

-- CreateTable
CREATE TABLE "core"."users" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."auth_accounts" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "subject_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."passkeys" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "public_key" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "transports" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(3),

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."families" (
    "id" UUID NOT NULL,
    "time_zone" TEXT,
    "last_change_number" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."memberships" (
    "user_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "role" "core"."membership_role" NOT NULL DEFAULT 'parent',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("user_id","family_id")
);

-- CreateTable
CREATE TABLE "core"."devices" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_accounts_user_id_idx" ON "core"."auth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_subject_hash_key" ON "core"."auth_accounts"("provider", "subject_hash");

-- CreateIndex
CREATE INDEX "passkeys_user_id_idx" ON "core"."passkeys"("user_id");

-- CreateIndex
CREATE INDEX "memberships_family_id_idx" ON "core"."memberships"("family_id");

-- CreateIndex
CREATE INDEX "devices_family_id_idx" ON "core"."devices"("family_id");

-- CreateIndex
CREATE INDEX "devices_user_id_idx" ON "core"."devices"("user_id");

-- AddForeignKey
ALTER TABLE "core"."auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."passkeys" ADD CONSTRAINT "passkeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."memberships" ADD CONSTRAINT "memberships_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."devices" ADD CONSTRAINT "devices_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RowLevelSecurity
ALTER TABLE "core"."families" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_isolation" ON "core"."families"
    USING ("id" = NULLIF(current_setting('app.family_id', true), '')::uuid)
    WITH CHECK ("id" = NULLIF(current_setting('app.family_id', true), '')::uuid);

-- RowLevelSecurity
ALTER TABLE "core"."devices" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_isolation" ON "core"."devices"
    USING ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid)
    WITH CHECK ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid);
