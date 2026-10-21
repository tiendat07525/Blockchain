import type { TxState } from "../hooks/useToken";
import { EXPLORER } from "../config";

export function TxToast({ tx, onClose }: { tx: TxState; onClose: () => void }) {
  if (tx.status === "idle") return null;

  const link = (hash: string) => (
    <a className="underline" target="_blank" rel="noreferrer" href={`${EXPLORER}/tx/${hash}`}>
      Xem trên Etherscan
    </a>
  );

  const view =
    tx.status === "wallet" ? { c: "bg-slate-800", m: <>Vui lòng xác nhận trong MetaMask…</> } :
    tx.status === "mining" ? { c: "bg-indigo-600", m: <>Đang chờ xác nhận on-chain… {link(tx.hash)}</> } :
    tx.status === "success" ? { c: "bg-emerald-600", m: <>Giao dịch thành công. {link(tx.hash)}</> } :
    { c: "bg-red-600", m: <>{tx.message}</> };

  return (
    <div className={`fixed bottom-4 left-1/2 w-[90%] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${view.c}`}>
      <div className="flex items-start justify-between gap-3">
        <div>{view.m}</div>
        {(tx.status === "success" || tx.status === "error") && (
          <button onClick={onClose} aria-label="Đóng" className="opacity-80 hover:opacity-100">✕</button>
        )}
      </div>
    </div>
  );
}