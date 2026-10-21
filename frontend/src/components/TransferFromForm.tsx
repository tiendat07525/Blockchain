import { useState } from "react";
import { isAddress } from "ethers";
import { amountError } from "../lib/format";

/** Ví đang kết nối (spender) chuyển token từ `from` sang `to` trong giới hạn allowance. */
export function TransferFromForm({ onSubmit, checkAllowance, account, symbol, busy }: {
  onSubmit: (from: string, to: string, amount: string) => Promise<boolean>;
  checkAllowance: (spender: string, owner: string) => Promise<string>;
  account: string;
  symbol: string;
  busy: boolean;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [allowance, setAllowance] = useState<string | null>(null);

  const fromErr = from && !isAddress(from) ? "Địa chỉ không hợp lệ" : "";
  const toErr = to && !isAddress(to) ? "Địa chỉ không hợp lệ" : "";
  const amtErr = amountError(amount) ||
    (allowance !== null && amount && Number(amount) > Number(allowance) ? "Vượt quá allowance" : "");
  const disabled = busy || !from || !to || !amount || !!fromErr || !!toErr || !!amtErr;

  const loadAllowance = async (owner: string) => {
    setAllowance(isAddress(owner) ? await checkAllowance(account, owner) : null);
  };

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">TransferFrom {symbol}</h3>
      <p className="text-xs text-slate-500">Dùng allowance mà ví khác đã approve cho bạn.</p>
      <input className="w-full rounded border px-3 py-2" placeholder="Từ địa chỉ (owner) 0x..."
             value={from}
             onChange={e => { setFrom(e.target.value.trim()); setAllowance(null); }}
             onBlur={() => loadAllowance(from)} />
      {fromErr && <p className="text-sm text-red-600">{fromErr}</p>}
      {allowance !== null && (
        <p className="text-sm text-slate-600">Allowance bạn được dùng: {allowance} {symbol}</p>
      )}
      <input className="w-full rounded border px-3 py-2" placeholder="Đến địa chỉ 0x..."
             value={to} onChange={e => setTo(e.target.value.trim())} />
      {toErr && <p className="text-sm text-red-600">{toErr}</p>}
      <input className="w-full rounded border px-3 py-2" placeholder="Số lượng" inputMode="decimal"
             value={amount} onChange={e => setAmount(e.target.value)} />
      {amtErr && <p className="text-sm text-red-600">{amtErr}</p>}
      <button disabled={disabled}
              onClick={async () => { if (await onSubmit(from, to, amount)) { setAmount(""); loadAllowance(from); } }}
              className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
        TransferFrom
      </button>
    </div>
  );
}
