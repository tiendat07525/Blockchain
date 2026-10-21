import { useWallet } from "./hooks/useWallet";
import { useToken } from "./hooks/useToken";
import { ConnectButton } from "./components/ConnectButton";
import { TokenInfo } from "./components/TokenInfo";
import { TransferForm } from "./components/TransferForm";
import { ApproveForm } from "./components/ApproveForm";
import { MintForm } from "./components/MintForm";
import { BurnForm } from "./components/BurnForm";
import { TxToast } from "./components/TxToast";
import { TransferFromForm } from "./components/TransferFromForm";
import { HistoryPanel } from "./components/HistoryPanel";

function App() {
  const w = useWallet();
  const ready = !!w.account && !w.wrongNetwork;
  const t = useToken(w.provider, w.signer, w.account, ready);
  const busy = t.tx.status === "wallet" || t.tx.status === "mining";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">TokenForge</h1>
          <ConnectButton
            account={w.account}
            hasMetaMask={w.hasMetaMask}
            onConnect={w.connect}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {w.error && (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {w.error}
          </p>
        )}

        {w.wrongNetwork && (
          <div className="flex items-center justify-between rounded border border-amber-300 bg-amber-50 p-3 text-sm">
            <span>Bạn đang ở sai mạng. Vui lòng chuyển sang Sepolia.</span>
            <button
              onClick={w.switchToSepolia}
              className="rounded bg-amber-600 px-3 py-1 text-white"
            >
              Chuyển sang Sepolia
            </button>
          </div>
        )}

        {t.loadError && ready && (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{t.loadError}</p>
        )}

        {!w.account ? (
          <p className="rounded-xl border bg-white p-6 text-center text-slate-600">
            {w.hasMetaMask
              ? "Kết nối MetaMask để xem số dư và quản lý token TFG."
              : "Chưa phát hiện MetaMask. Hãy cài tiện ích MetaMask rồi tải lại trang."}
          </p>
        ) : (
          <>
            <TokenInfo info={t.info} balance={t.balance} isOwner={t.isOwner} />

            {ready && (
              <div className="grid gap-4 md:grid-cols-2">
                <TransferForm
                  onSubmit={t.transfer}
                  balance={t.balance}
                  symbol={t.info.symbol}
                  busy={busy}
                />
                <ApproveForm
                  onApprove={t.approve}
                  checkAllowance={t.checkAllowance}
                  symbol={t.info.symbol}
                  busy={busy}
                />
                <TransferFromForm
                  onSubmit={t.transferFrom}
                  checkAllowance={t.checkAllowance}
                  account={w.account}
                  symbol={t.info.symbol}
                  busy={busy}
                />
                <BurnForm
                  onSubmit={t.burn}
                  balance={t.balance}
                  symbol={t.info.symbol}
                  busy={busy}
                />
                {t.isOwner && (
                  <MintForm
                    onSubmit={t.mint}
                    symbol={t.info.symbol}
                    busy={busy}
                  />
                )}
              </div>
            )}

            {ready && <HistoryPanel account={w.account} symbol={t.info.symbol} reloadKey={t.historyKey} />}
          </>
        )}
      </main>

      <TxToast tx={t.tx} onClose={t.dismissTx} />
    </div>
  );
}

export default App;