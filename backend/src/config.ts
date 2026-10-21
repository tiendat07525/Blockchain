import "dotenv/config";
import { getAddress } from "ethers";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name} (xem backend/.env.example)`);
  return v;
}

function int(name: string, def: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return def;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) throw new Error(`${name} phải là số nguyên >= 0`);
  return n;
}

export const config = {
  port: int("PORT", 4000),
  rpcUrl: required("RPC_URL"),
  tokenAddress: getAddress(required("TOKEN_ADDRESS")),
  deployBlock: int("DEPLOY_BLOCK", 0),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",").map(s => s.trim()),
  runIndexer: (process.env.RUN_INDEXER ?? "true") === "true",
  confirmations: int("CONFIRMATIONS", 6),
  batchSize: Math.max(1, int("BATCH_SIZE", 2000)),
  pollIntervalMs: int("POLL_INTERVAL_MS", 12000),
};
