import { useState } from "react";
import { isAddress } from "ethers";

export function TransferForm({ onSubmit, balance, symbol, busy }:
  { onSubmit: (to: string, amount: string) => void; balance: string; symbol: string; busy: boolean }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const addrErr = to && !isAddress(to) ? "Địa chỉ không hợp lệ" : "";
  const n = Number(amount);
  const amtErr = amount && (!(n > 0) ? "Số lượng phải > 0" : n > Number(balance) ? "Vượt quá số dư" : "");
  const disabled = busy || !to || !amount || !!addrErr || !!amtErr;

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <h3 className="font-semibold">Chuyển {symbol}</h3>
      <input className="w-full border rounded px-3 py-2" placeholder="Địa chỉ nhận 0x..."
             value={to} onChange={e => setTo(e.target.value.trim())} />
      {addrErr && <p className="text-sm text-red-600">{addrErr}</p>}
      <input className="w-full border rounded px-3 py-2" placeholder="Số lượng" inputMode="decimal"
             value={amount} onChange={e => setAmount(e.target.value)} />
      {amtErr && <p className="text-sm text-red-600">{amtErr}</p>}
      <button disabled={disabled} onClick={() => onSubmit(to, amount)}
              className="rounded bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">Gửi</button>
    </div>
  );
}