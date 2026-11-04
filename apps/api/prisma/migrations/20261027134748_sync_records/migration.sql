-- CreateTable
CREATE TABLE "core"."records" (
    "family_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "field_changed_at" JSONB NOT NULL,
    "change_number" BIGINT NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "records_pkey" PRIMARY KEY ("family_id","kind","id")
);

-- CreateTable
CREATE TABLE "core"."processed_mutations" (
    "family_id" UUID NOT NULL,
    "mutation_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_mutations_pkey" PRIMARY KEY ("family_id","mutation_id")
);

-- CreateIndex
CREATE INDEX "records_family_id_change_number_idx" ON "core"."records"("family_id", "change_number");

-- AddForeignKey
ALTER TABLE "core"."records" ADD CONSTRAINT "records_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."processed_mutations" ADD CONSTRAINT "processed_mutations_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "core"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RowLevelSecurity
ALTER TABLE "core"."records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_isolation" ON "core"."records"
    USING ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid)
    WITH CHECK ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid);

-- RowLevelSecurity
ALTER TABLE "core"."processed_mutations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_isolation" ON "core"."processed_mutations"
    USING ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid)
    WITH CHECK ("family_id" = NULLIF(current_setting('app.family_id', true), '')::uuid);
