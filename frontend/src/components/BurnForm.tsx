import { useState } from "react";

export function BurnForm({ onSubmit, balance, symbol, busy }:
  { onSubmit: (amount: string) => void; balance: string; symbol: string; busy: boolean }) {
  const [amount, setAmount] = useState("");

  const n = Number(amount);
  const amtErr = amount && (!(n > 0) ? "Số lượng phải > 0" : n > Number(balance) ? "Vượt quá số dư" : "");
  const disabled = busy || !amount || !!amtErr;

  const handle = () => {
    if (window.confirm(`Burn ${amount} ${symbol}? Hành động này không thể hoàn tác.`)) onSubmit(amount);
  };

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Burn {symbol}</h3>
      <input className="w-full rounded border px-3 py-2" placeholder="Số lượng" inputMode="decimal"
             value={amount} onChange={e => setAmount(e.target.value)} />
      {amtErr && <p className="text-sm text-red-600">{amtErr}</p>}
      <button disabled={disabled} onClick={handle}
              className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50">
        Burn
      </button>
    </div>
  );
}