import { EXPLORER, TOKEN_ADDRESS } from "../config";
import { shortAddress } from "../lib/format";

type Info = { name: string; symbol: string; decimals: number; totalSupply: string; owner: string };

export function TokenInfo({ info, balance, isOwner }:
  { info: Info; balance: string; isOwner: boolean }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Số dư của bạn</p>
          <p className="text-3xl font-bold">
            {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
            <span className="text-xl text-slate-500">{info.symbol}</span>
          </p>
        </div>
        {isOwner && (
          <span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Owner</span>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <dt className="text-slate-500">Token</dt>
        <dd>{info.name} ({info.symbol})</dd>
        <dt className="text-slate-500">Tổng cung</dt>
        <dd>{Number(info.totalSupply).toLocaleString()} {info.symbol}</dd>
        <dt className="text-slate-500">Owner</dt>
        <dd className="font-mono">{info.owner && shortAddress(info.owner)}</dd>
        <dt className="text-slate-500">Contract</dt>
        <dd>
          <a className="font-mono text-indigo-600 underline" target="_blank" rel="noreferrer"
             href={`${EXPLORER}/token/${TOKEN_ADDRESS}`}>
            {shortAddress(TOKEN_ADDRESS)}
          </a>
        </dd>
      </dl>
    </div>
  );
}