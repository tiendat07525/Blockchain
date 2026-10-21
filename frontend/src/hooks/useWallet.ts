import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { CHAIN_ID, CHAIN_ID_HEX } from "../config";
import { errorCode } from "../lib/errors";

type WalletState = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
};

const EMPTY: WalletState = { provider: null, signer: null, account: null, chainId: null };

async function readWallet(): Promise<WalletState> {
  if (!window.ethereum) return EMPTY;
  const provider = new BrowserProvider(window.ethereum);
  const accounts = (await provider.send("eth_accounts", [])) as string[];
  const net = await provider.getNetwork();
  const account = accounts[0] ?? null;
  return {
    provider,
    chainId: Number(net.chainId),
    account,
    signer: account ? await provider.getSigner() : null,
  };
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;

  const sync = useCallback(async () => {
    try {
      setState(await readWallet());
    } catch {
      setError("Không đọc được trạng thái ví");
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (!window.ethereum) return setError("Chưa cài MetaMask");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await sync();
    } catch (e) {
      setError(errorCode(e) === 4001 ? "Bạn đã từ chối kết nối" : "Kết nối thất bại");
    }
  }, [sync]);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    } catch {
      setError("Không đổi được sang Sepolia");
    }
  }, []);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    let active = true;
    const onChange = () => {
      readWallet()
        .then(s => { if (active) setState(s); })
        .catch(() => { if (active) setError("Không đọc được trạng thái ví"); });
    };
    onChange();
    eth.on("accountsChanged", onChange);
    eth.on("chainChanged", onChange);
    return () => {
      active = false;
      eth.removeListener("accountsChanged", onChange);
      eth.removeListener("chainChanged", onChange);
    };
  }, []);

  return {
    ...state,
    error,
    hasMetaMask,
    wrongNetwork: state.chainId !== null && state.chainId !== CHAIN_ID,
    connect,
    switchToSepolia,
  };
}
