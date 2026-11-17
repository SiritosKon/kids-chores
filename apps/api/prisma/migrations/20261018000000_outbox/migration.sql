-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateTable
CREATE TABLE "core"."outbox" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "family_id" UUID,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ(3),

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_sent_at_occurred_at_idx" ON "core"."outbox"("sent_at", "occurred_at");

