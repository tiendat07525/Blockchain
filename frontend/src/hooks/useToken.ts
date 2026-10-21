import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, formatUnits, parseUnits, BrowserProvider, JsonRpcSigner } from "ethers";
import type { ContractTransactionResponse } from "ethers";
import { TOKEN_ABI } from "../abi";
import { TOKEN_ADDRESS } from "../config";
import { parseError } from "../lib/errors";

export { parseError };

export type TxState =
  | { status: "idle" }
  | { status: "wallet" }                       // chờ xác nhận trong MetaMask
  | { status: "mining"; hash: string }
  | { status: "success"; hash: string }
  | { status: "error"; message: string };

export type TokenInfoData = { name: string; symbol: string; decimals: number; totalSupply: string; owner: string };

const EMPTY_INFO: TokenInfoData = { name: "", symbol: "", decimals: 18, totalSupply: "0", owner: "" };

async function loadToken(c: Contract, account: string | null) {
  const [name, symbol, decimals, supply, owner] = await Promise.all([
    c.name(), c.symbol(), c.decimals(), c.totalSupply(), c.owner(),
  ]);
  const d = Number(decimals);
  const info: TokenInfoData = { name, symbol, decimals: d, totalSupply: formatUnits(supply, d), owner };
  const balance = account ? formatUnits(await c.balanceOf(account), d) : "0";
  return { info, balance };
}

/**
 * @param enabled false khi chưa kết nối hoặc sai mạng – tránh gọi contract trên chain khác.
 */
export function useToken(
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null,
  account: string | null,
  enabled = true,
) {
  const [info, setInfo] = useState<TokenInfoData>(EMPTY_INFO);
  const [balance, setBalance] = useState("0");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const [version, setVersion] = useState(0); // tăng để buộc tải lại

  const readContract = useMemo(
    () => (provider && enabled ? new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider) : null), [provider, enabled]);
  const writeContract = useMemo(
    () => (signer && enabled ? new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer) : null), [signer, enabled]);

  useEffect(() => {
    if (!readContract) return;
    let active = true;
    loadToken(readContract, account)
      .then(r => {
        if (!active) return;
        setInfo(r.info);
        setBalance(r.balance);
        setLoadError(null);
      })
      .catch(e => { if (active) setLoadError(`Không đọc được dữ liệu token: ${parseError(e)}`); });
    return () => { active = false; };
  }, [readContract, account, version]);

  const refresh = useCallback(() => setVersion(v => v + 1), []);

  // Tự ẩn thông báo thành công sau 8 giây
  useEffect(() => {
    if (tx.status !== "success") return;
    const id = setTimeout(() => setTx({ status: "idle" }), 8000);
    return () => clearTimeout(id);
  }, [tx]);

  const send = useCallback(async (fn: (c: Contract) => Promise<ContractTransactionResponse>) => {
    if (!writeContract) return false;
    try {
      setTx({ status: "wallet" });
      const resp = await fn(writeContract);
      setTx({ status: "mining", hash: resp.hash });
      await resp.wait();
      setTx({ status: "success", hash: resp.hash });
      refresh();
      return true;
    } catch (e) {
      setTx({ status: "error", message: parseError(e) });
      return false;
    }
  }, [writeContract, refresh]);

  const amt = (v: string) => parseUnits(v.trim(), info.decimals);

  return {
    info, balance, tx, loadError, refresh, historyKey: version,
    isOwner: !!account && !!info.owner && account.toLowerCase() === info.owner.toLowerCase(),
    dismissTx: () => setTx({ status: "idle" }),
    transfer: (to: string, v: string) => send(c => c.transfer(to, amt(v))),
    approve:  (sp: string, v: string) => send(c => c.approve(sp, amt(v))),
    transferFrom: (from: string, to: string, v: string) => send(c => c.transferFrom(from, to, amt(v))),
    mint:     (to: string, v: string) => send(c => c.mint(to, amt(v))),
    burn:     (v: string) => send(c => c.burn(amt(v))),
    /** Allowance mà `owner` cấp cho `spender` (mặc định owner = ví đang kết nối). */
    checkAllowance: async (spender: string, owner: string | null = account) =>
      owner && readContract ? formatUnits(await readContract.allowance(owner, spender), info.decimals) : "0",
  };
}
