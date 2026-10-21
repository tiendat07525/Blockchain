import { formatUnits, isAddress, ZeroAddress } from "ethers";
import type { Prisma } from "@prisma/client";

export const DECIMALS = 18;
export const ZERO = ZeroAddress.toLowerCase();

/** Prisma Decimal (wei) -> chuỗi số token, vd "12.5" */
export function toAmount(v: Prisma.Decimal | bigint | string): string {
  const wei = typeof v === "bigint" ? v : BigInt(typeof v === "string" ? v : v.toFixed(0));
  return formatUnits(wei, DECIMALS);
}

export function toWei(v: Prisma.Decimal): string {
  return v.toFixed(0);
}

export function normAddress(a: unknown): string | null {
  return typeof a === "string" && isAddress(a) ? a.toLowerCase() : null;
}

export function pagination(q: Record<string, unknown>, maxLimit = 100) {
  const page = Math.max(1, Number.parseInt(String(q.page ?? "1"), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(String(q.limit ?? "20"), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
