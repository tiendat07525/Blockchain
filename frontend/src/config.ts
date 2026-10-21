export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
export const CHAIN_ID = 11155111;
export const CHAIN_ID_HEX = "0xaa36a7";
export const EXPLORER = "https://sepolia.etherscan.io";
/** URL backend (Phase 5). Để trống thì frontend ẩn phần lịch sử giao dịch. */
export const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

if (!TOKEN_ADDRESS) {
  console.error("Thiếu VITE_TOKEN_ADDRESS trong frontend/.env");
}
