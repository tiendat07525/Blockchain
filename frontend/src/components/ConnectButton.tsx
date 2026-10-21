import { shortAddress } from "../lib/format";

export function ConnectButton({ account, hasMetaMask, onConnect }:
  { account: string | null; hasMetaMask: boolean; onConnect: () => void }) {
  if (account) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-sm">
        {shortAddress(account)}
      </span>
    );
  }
  if (!hasMetaMask) {
    return (
      <a href="https://metamask.io/download/" target="_blank" rel="noreferrer"
         className="rounded bg-indigo-600 px-4 py-2 text-sm text-white">
        Cài MetaMask
      </a>
    );
  }
  return (
    <button onClick={onConnect} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white">
      Kết nối MetaMask
    </button>
  );
}