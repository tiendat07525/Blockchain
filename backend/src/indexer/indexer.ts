import type { Log } from "ethers";
import { Prisma, TransferType } from "@prisma/client";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { provider, iface, TRANSFER_TOPIC, APPROVAL_TOPIC } from "../chain.js";
import { ZERO } from "../lib/format.js";

const STATE_ID = "token-events";

type ParsedTransfer = Prisma.TransferCreateManyInput & { valueBig: bigint };

export async function getLastIndexedBlock(): Promise<number> {
  const s = await prisma.syncState.findUnique({ where: { id: STATE_ID } });
  return s?.lastBlock ?? config.deployBlock - 1;
}

async function blockTimes(blockNumbers: number[]): Promise<Map<number, Date>> {
  const map = new Map<number, Date>();
  for (const n of [...new Set(blockNumbers)]) {
    const b = await provider.getBlock(n);
    if (!b) throw new Error(`Không lấy được block ${n}`);
    map.set(n, new Date(b.timestamp * 1000));
  }
  return map;
}

function classify(from: string, to: string): TransferType {
  if (from === ZERO) return TransferType.MINT;
  if (to === ZERO) return TransferType.BURN;
  return TransferType.TRANSFER;
}

/** Index các event trong [fromBlock, toBlock]. Ghi dữ liệu + con trỏ trong cùng 1 transaction DB. */
export async function indexRange(fromBlock: number, toBlock: number) {
  const logs: Log[] = await provider.getLogs({
    address: config.tokenAddress,
    fromBlock,
    toBlock,
    topics: [[TRANSFER_TOPIC, APPROVAL_TOPIC]],
  });

  const times = await blockTimes(logs.map(l => l.blockNumber));
  const transfers: ParsedTransfer[] = [];
  const approvals: Prisma.ApprovalCreateManyInput[] = [];

  for (const log of logs) {
    const parsed = iface.parseLog(log);
    if (!parsed) continue;
    const base = {
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      blockTime: times.get(log.blockNumber)!,
    };
    if (parsed.name === "Transfer") {
      const from = (parsed.args[0] as string).toLowerCase();
      const to = (parsed.args[1] as string).toLowerCase();
      const valueBig = parsed.args[2] as bigint;
      transfers.push({ ...base, from, to, value: valueBig.toString(), valueBig, type: classify(from, to) });
    } else if (parsed.name === "Approval") {
      approvals.push({
        ...base,
        owner: (parsed.args[0] as string).toLowerCase(),
        spender: (parsed.args[1] as string).toLowerCase(),
        value: (parsed.args[2] as bigint).toString(),
      });
    }
  }

  // Gộp thay đổi số dư theo địa chỉ
  const deltas = new Map<string, bigint>();
  const add = (addr: string, v: bigint) => {
    if (addr === ZERO) return;
    deltas.set(addr, (deltas.get(addr) ?? 0n) + v);
  };
  for (const t of transfers) {
    add(t.from, -t.valueBig);
    add(t.to, t.valueBig);
  }

  await prisma.$transaction(async tx => {
    if (transfers.length) {
      await tx.transfer.createMany({
        data: transfers.map(({ valueBig: _v, ...rest }) => rest),
        skipDuplicates: true,
      });
    }
    if (approvals.length) {
      await tx.approval.createMany({ data: approvals, skipDuplicates: true });
    }
    for (const [address, delta] of deltas) {
      if (delta === 0n) continue;
      await tx.holder.upsert({
        where: { address },
        create: { address, balance: delta.toString() },
        update: { balance: { increment: delta.toString() } },
      });
    }
    await tx.syncState.upsert({
      where: { id: STATE_ID },
      create: { id: STATE_ID, lastBlock: toBlock },
      update: { lastBlock: toBlock },
    });
  }, { timeout: 60_000 });

  return { logs: logs.length, transfers: transfers.length, approvals: approvals.length };
}

/** Đồng bộ tới (head - confirmations). Trả về block cuối đã index. */
export async function syncOnce(log = console.log): Promise<number> {
  const head = await provider.getBlockNumber();
  const target = head - config.confirmations;
  let last = await getLastIndexedBlock();

  while (last < target) {
    const from = last + 1;
    const to = Math.min(from + config.batchSize - 1, target);
    const r = await indexRange(from, to);
    log(`[indexer] block ${from}-${to}: ${r.transfers} transfer, ${r.approvals} approval`);
    last = to;
  }
  return last;
}

let stopped = false;

export function stopIndexer() {
  stopped = true;
}

/** Vòng lặp poll liên tục; lỗi RPC/DB tạm thời sẽ được thử lại ở lần poll sau. */
export async function runIndexerLoop() {
  console.log(`[indexer] start – token ${config.tokenAddress}, từ block ${config.deployBlock}, confirmations=${config.confirmations}`);
  stopped = false;
  while (!stopped) {
    try {
      await syncOnce();
    } catch (e) {
      console.error("[indexer] lỗi, sẽ thử lại:", e instanceof Error ? e.message : e);
    }
    await new Promise(r => setTimeout(r, config.pollIntervalMs));
  }
}
