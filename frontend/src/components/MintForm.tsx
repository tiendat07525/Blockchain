import { useState } from "react";
import { isAddress } from "ethers";

export function MintForm({ onSubmit, symbol, busy }:
  { onSubmit: (to: string, amount: string) => void; symbol: string; busy: boolean }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const addrErr = to && !isAddress(to) ? "Địa chỉ không hợp lệ" : "";
  const amtErr = amount && !(Number(amount) > 0) ? "Số lượng phải > 0" : "";
  const disabled = busy || !to || !amount || !!addrErr || !!amtErr;

  return (
    <div className="space-y-3 rounded-xl border border-emerald-200 bg-white p-4">
      <h3 className="font-semibold">Mint {symbol} <span className="text-xs text-emerald-600">(owner)</span></h3>
      <input className="w-full rounded border px-3 py-2" placeholder="Địa chỉ nhận 0x..."
             value={to} onChange={e => setTo(e.target.value.trim())} />
      {addrErr && <p className="text-sm text-red-600">{addrErr}</p>}
      <input className="w-full rounded border px-3 py-2" placeholder="Số lượng" inputMode="decimal"
             value={amount} onChange={e => setAmount(e.target.value)} />
      {amtErr && <p className="text-sm text-red-600">{amtErr}</p>}
      <button disabled={disabled} onClick={() => onSubmit(to, amount)}
              className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
        Mint
      </button>
    </div>
  );
}