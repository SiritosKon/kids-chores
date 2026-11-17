-- CreateTable
CREATE TABLE "core"."media" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_family_id_idx" ON "core"."media"("family_id");

-- AddForeignKey
ALTER TABLE "core"."media" ADD CONSTRAINT "media_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RowLevelSecurity
ALTER TABLE "core"."media" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_isolation" ON "core"."media"
    USING ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid)
    WITH CHECK ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid);
