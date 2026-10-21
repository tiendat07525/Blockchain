import { useState } from "react";
import { isAddress } from "ethers";

export function ApproveForm({ onApprove, checkAllowance, symbol, busy }: {
  onApprove: (spender: string, amount: string) => void;
  checkAllowance: (spender: string) => Promise<string>;
  symbol: string;
  busy: boolean;
}) {
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [allowance, setAllowance] = useState<string | null>(null);

  const addrErr = spender && !isAddress(spender) ? "Địa chỉ không hợp lệ" : "";
  const amtErr = amount && !(Number(amount) >= 0) ? "Số lượng không hợp lệ" : "";
  const disabled = busy || !spender || amount === "" || !!addrErr || !!amtErr;

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Approve {symbol}</h3>
      <input className="w-full rounded border px-3 py-2" placeholder="Địa chỉ spender 0x..."
             value={spender} onChange={e => { setSpender(e.target.value.trim()); setAllowance(null); }} />
      {addrErr && <p className="text-sm text-red-600">{addrErr}</p>}
      <input className="w-full rounded border px-3 py-2" placeholder="Số lượng cho phép" inputMode="decimal"
             value={amount} onChange={e => setAmount(e.target.value)} />
      {amtErr && <p className="text-sm text-red-600">{amtErr}</p>}
      <div className="flex items-center gap-2">
        <button disabled={disabled} onClick={() => onApprove(spender, amount)}
                className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
          Approve
        </button>
        <button disabled={!isAddress(spender)}
                onClick={async () => setAllowance(await checkAllowance(spender))}
                className="rounded border px-4 py-2 disabled:opacity-50">
          Xem allowance
        </button>
      </div>
      {allowance !== null && (
        <p className="text-sm text-slate-600">Allowance hiện tại: {allowance} {symbol}</p>
      )}
    </div>
  );
}