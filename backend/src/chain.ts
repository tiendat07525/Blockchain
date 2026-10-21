import { Contract, Interface, JsonRpcProvider } from "ethers";
import { config } from "./config.js";

export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

export const iface = new Interface(TOKEN_ABI);
export const TRANSFER_TOPIC = iface.getEvent("Transfer")!.topicHash;
export const APPROVAL_TOPIC = iface.getEvent("Approval")!.topicHash;

export const provider = new JsonRpcProvider(config.rpcUrl, 11155111, { staticNetwork: true });
export const token = new Contract(config.tokenAddress, TOKEN_ABI, provider);
