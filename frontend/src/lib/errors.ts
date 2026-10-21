type EthersLikeError = {
  code?: string | number;
  reason?: string;
  shortMessage?: string;
  message?: string;
  info?: { error?: { code?: number; message?: string } };
};

/** Chuyển lỗi ethers/MetaMask thành thông báo tiếng Việt dễ hiểu. */
export function parseError(e: unknown): string {
  const err = (e ?? {}) as EthersLikeError;
  if (err.code === "ACTION_REJECTED" || err.code === 4001 || err.info?.error?.code === 4001) {
    return "Bạn đã từ chối giao dịch";
  }
  if (err.code === "INSUFFICIENT_FUNDS") return "Không đủ ETH để trả phí gas";
  const reason = err.reason || err.shortMessage || err.info?.error?.message || err.message;
  if (reason?.includes("OwnableUnauthorizedAccount")) return "Chỉ owner mới được mint";
  if (reason?.includes("ERC20InsufficientBalance")) return "Số dư không đủ";
  if (reason?.includes("ERC20InsufficientAllowance")) return "Allowance không đủ";
  if (reason?.includes("invalid decimal") || reason?.includes("too many decimals")) return "Số lượng không hợp lệ";
  return reason ?? "Giao dịch thất bại";
}

export function errorCode(e: unknown): string | number | undefined {
  return (e as EthersLikeError | undefined)?.code;
}
