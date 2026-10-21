import { Router } from "express";
import { Prisma, TransferType } from "@prisma/client";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { provider, token } from "../chain.js";
import { getLastIndexedBlock } from "../indexer/indexer.js";
import { HttpError, normAddress, pagination, toAmount, toWei } from "../lib/format.js";

export const api = Router();

type TransferRow = Awaited<ReturnType<typeof prisma.transfer.findMany>>[number];

const serializeTransfer = (t: TransferRow) => ({
  txHash: t.txHash,
  logIndex: t.logIndex,
  blockNumber: t.blockNumber,
  timestamp: t.blockTime.toISOString(),
  from: t.from,
  to: t.to,
  type: t.type,
  value: toWei(t.value),
  amount: toAmount(t.value),
});

function parseType(v: unknown): TransferType | undefined {
  if (v === undefined) return undefined;
  const s = String(v).toUpperCase();
  if (s in TransferType) return s as TransferType;
  throw new HttpError(400, "type phải là MINT | BURN | TRANSFER");
}

function requireAddress(v: unknown): string {
  const a = normAddress(v);
  if (!a) throw new HttpError(400, "Địa chỉ không hợp lệ");
  return a;
}

async function listTransfers(where: Prisma.TransferWhereInput, q: Record<string, unknown>) {
  const { page, limit, skip } = pagination(q);
  const [items, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      orderBy: [{ blockNumber: "desc" }, { logIndex: "desc" }],
      skip,
      take: limit,
    }),
    prisma.transfer.count({ where }),
  ]);
  return { items: items.map(serializeTransfer), total, page, limit };
}

// Thông tin token đọc on-chain (cache 30s để giảm gọi RPC)
let tokenCache: { at: number; data: unknown } | null = null;
api.get("/token", async (_req, res) => {
  if (!tokenCache || Date.now() - tokenCache.at > 30_000) {
    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      token.name(), token.symbol(), token.decimals(), token.totalSupply(), token.owner(),
    ]);
    tokenCache = {
      at: Date.now(),
      data: {
        address: config.tokenAddress,
        chainId: 11155111,
        deployBlock: config.deployBlock,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: toAmount(totalSupply as bigint),
        owner,
      },
    };
  }
  res.json(tokenCache.data);
});

api.get("/stats", async (_req, res) => {
  const [transferCount, holderCount, minted, burned, approvalCount, lastIndexedBlock] = await Promise.all([
    prisma.transfer.count(),
    prisma.holder.count({ where: { balance: { gt: 0 } } }),
    prisma.transfer.aggregate({ where: { type: "MINT" }, _sum: { value: true } }),
    prisma.transfer.aggregate({ where: { type: "BURN" }, _sum: { value: true } }),
    prisma.approval.count(),
    getLastIndexedBlock(),
  ]);
  const totalMinted = minted._sum.value ?? new Prisma.Decimal(0);
  const totalBurned = burned._sum.value ?? new Prisma.Decimal(0);
  res.json({
    transferCount,
    approvalCount,
    holderCount,
    totalMinted: toAmount(totalMinted),
    totalBurned: toAmount(totalBurned),
    indexedSupply: toAmount(totalMinted.minus(totalBurned)),
    lastIndexedBlock,
  });
});

// GET /api/transfers?type=MINT&address=0x..&page=1&limit=20
api.get("/transfers", async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const where: Prisma.TransferWhereInput = {};
  const type = parseType(q.type);
  if (type) where.type = type;
  if (q.address !== undefined) {
    const a = requireAddress(q.address);
    where.OR = [{ from: a }, { to: a }];
  }
  res.json(await listTransfers(where, q));
});

api.get("/transfers/:txHash", async (req, res) => {
  const items = await prisma.transfer.findMany({
    where: { txHash: req.params.txHash.toLowerCase() },
    orderBy: { logIndex: "asc" },
  });
  if (!items.length) throw new HttpError(404, "Không tìm thấy giao dịch (có thể indexer chưa đồng bộ tới)");
  res.json({ items: items.map(serializeTransfer) });
});

api.get("/accounts/:address", async (req, res) => {
  const address = requireAddress(req.params.address);
  const [holder, sent, received] = await Promise.all([
    prisma.holder.findUnique({ where: { address } }),
    prisma.transfer.count({ where: { from: address } }),
    prisma.transfer.count({ where: { to: address } }),
  ]);
  res.json({
    address,
    balance: toAmount(holder?.balance ?? new Prisma.Decimal(0)),
    sentCount: sent,
    receivedCount: received,
  });
});

api.get("/accounts/:address/transfers", async (req, res) => {
  const address = requireAddress(req.params.address);
  const q = req.query as Record<string, unknown>;
  const where: Prisma.TransferWhereInput = { OR: [{ from: address }, { to: address }] };
  const type = parseType(q.type);
  if (type) where.type = type;
  res.json(await listTransfers(where, q));
});

// Top holder theo số dư đã index
api.get("/holders", async (req, res) => {
  const { page, limit, skip } = pagination(req.query as Record<string, unknown>);
  const where = { balance: { gt: 0 } };
  const [items, total] = await Promise.all([
    prisma.holder.findMany({ where, orderBy: { balance: "desc" }, skip, take: limit }),
    prisma.holder.count({ where }),
  ]);
  res.json({
    items: items.map(h => ({ address: h.address, balance: toAmount(h.balance) })),
    total,
    page,
    limit,
  });
});

// GET /api/approvals?owner=0x..&spender=0x..
api.get("/approvals", async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const where: Prisma.ApprovalWhereInput = {};
  if (q.owner !== undefined) where.owner = requireAddress(q.owner);
  if (q.spender !== undefined) where.spender = requireAddress(q.spender);
  const { page, limit, skip } = pagination(q);
  const [items, total] = await Promise.all([
    prisma.approval.findMany({ where, orderBy: [{ blockNumber: "desc" }, { logIndex: "desc" }], skip, take: limit }),
    prisma.approval.count({ where }),
  ]);
  res.json({
    items: items.map(a => ({
      txHash: a.txHash,
      logIndex: a.logIndex,
      blockNumber: a.blockNumber,
      timestamp: a.blockTime.toISOString(),
      owner: a.owner,
      spender: a.spender,
      value: toWei(a.value),
      amount: toAmount(a.value),
    })),
    total,
    page,
    limit,
  });
});

export async function health() {
  const [lastIndexedBlock, head] = await Promise.all([
    getLastIndexedBlock(),
    provider.getBlockNumber().catch(() => null),
  ]);
  await prisma.$queryRaw`SELECT 1`;
  return {
    ok: true,
    lastIndexedBlock,
    chainHead: head,
    lag: head === null ? null : head - lastIndexedBlock,
  };
}
