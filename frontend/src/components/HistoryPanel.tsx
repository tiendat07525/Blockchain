import { useEffect, useState } from "react";
import { API_URL, EXPLORER } from "../config";
import { shortAddress } from "../lib/format";

type Item = {
  txHash: string;
  logIndex: number;
  blockNumber: number;
  from: string;
  to: string;
  amount: string;
  type: "MINT" | "BURN" | "TRANSFER";
  timestamp: string;
};

const LABEL: Record<Item["type"], string> = { MINT: "Mint", BURN: "Burn", TRANSFER: "Chuyển" };

/** Lịch sử giao dịch của ví, đọc từ backend/indexer. Ẩn nếu chưa cấu hình VITE_API_URL. */
export function HistoryPanel({ account, symbol, reloadKey }: { account: string; symbol: string; reloadKey: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) return;
    const ctrl = new AbortController();
    fetch(`${API_URL}/api/accounts/${account}/transfers?limit=20`, { signal: ctrl.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { items: Item[] }) => { setItems(d.items); setError(null); })
      .catch(e => { if (e.name !== "AbortError") setError("Không tải được lịch sử từ backend"); });
    return () => ctrl.abort();
  }, [account, reloadKey]);

  if (!API_URL) return null;
  const me = account.toLowerCase();

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">Lịch sử giao dịch</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && items.length === 0 && <p className="text-sm text-slate-500">Chưa có giao dịch nào (hoặc indexer chưa đồng bộ tới).</p>}
      <ul className="divide-y text-sm">
        {items.map(it => {
          const incoming = it.to.toLowerCase() === me;
          return (
            <li key={`${it.txHash}-${it.logIndex}`} className="flex items-center justify-between gap-2 py-2">
              <div>
                <span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{LABEL[it.type]}</span>
                <span className="font-mono text-xs text-slate-600">
                  {it.type === "TRANSFER" ? (incoming ? `từ ${shortAddress(it.from)}` : `tới ${shortAddress(it.to)}`) : ""}
                </span>
                <div className="text-xs text-slate-400">{new Date(it.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className={incoming ? "text-emerald-600" : "text-red-600"}>
                  {incoming ? "+" : "-"}{Number(it.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
                </div>
                <a className="text-xs text-indigo-600 underline" target="_blank" rel="noreferrer"
                   href={`${EXPLORER}/tx/${it.txHash}`}>Etherscan</a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
