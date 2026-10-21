-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('MINT', 'BURN', 'TRANSFER');

-- CreateTable
CREATE TABLE "Transfer" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTime" TIMESTAMP(3) NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" DECIMAL(78,0) NOT NULL,
    "type" "TransferType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTime" TIMESTAMP(3) NOT NULL,
    "owner" TEXT NOT NULL,
    "spender" TEXT NOT NULL,
    "value" DECIMAL(78,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holder" (
    "address" TEXT NOT NULL,
    "balance" DECIMAL(78,0) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holder_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "lastBlock" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transfer_from_idx" ON "Transfer"("from");

-- CreateIndex
CREATE INDEX "Transfer_to_idx" ON "Transfer"("to");

-- CreateIndex
CREATE INDEX "Transfer_blockNumber_idx" ON "Transfer"("blockNumber");

-- CreateIndex
CREATE INDEX "Transfer_type_idx" ON "Transfer"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_txHash_logIndex_key" ON "Transfer"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "Approval_owner_idx" ON "Approval"("owner");

-- CreateIndex
CREATE INDEX "Approval_spender_idx" ON "Approval"("spender");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_txHash_logIndex_key" ON "Approval"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "Holder_balance_idx" ON "Holder"("balance");
