-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "accessTokenHash" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "reportFingerprint" TEXT,
ADD COLUMN     "reportPayload" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
