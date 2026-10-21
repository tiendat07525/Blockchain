# TokenForge – Contracts

ERC-20 **TokenForge (TFG)**, 18 decimals, dùng OpenZeppelin 5:
- `ERC20` + `ERC20Burnable` (holder tự burn, `burnFrom` qua allowance)
- `Ownable` – chỉ owner được `mint(to, amount)`
- Constructor: `(initialOwner, initialSupply)` – mint toàn bộ initial supply cho owner

## Lệnh

```bash
npm install
npm run compile
npm test                 # 17 test (Deployment, Transfer, Approve/TransferFrom, Mint, Burn, Ownership)
npm run coverage         # 100% line/statement
npm run deploy:local     # deploy thử trên mạng mô phỏng
npm run deploy:sepolia   # cần SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY (hardhat keystore)
npm run verify:sepolia   # cần ETHERSCAN_API_KEY
```

Biến bí mật được quản lý bằng `npx hardhat keystore set <TÊN>` hoặc biến môi trường – **không** commit vào git.

## Deployment (Sepolia)

| | |
|---|---|
| Address | `0x4D7b251399E5B8Db210Ad2C722B48c6c3A07f795` |
| Deploy block | 11956531 |
| Owner | `0x2631b6C3e0FCcc7CD952F4a12Fd8de27b33E1f2a` |
| Initial supply | 1,000,000 TFG |
| Etherscan | https://sepolia.etherscan.io/address/0x4D7b251399E5B8Db210Ad2C722B48c6c3A07f795#code (verified) |

Chi tiết trong `deployments/sepolia.json`; ABI dùng chung ở `shared/TokenForge.abi.json`.
