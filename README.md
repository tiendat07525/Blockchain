# TokenForge (TFG)

DApp quản lý token ERC-20 **TokenForge (TFG)** trên Ethereum Sepolia – đồ án môn Blockchain.

| Thành phần | Công nghệ | Trạng thái |
|---|---|---|
| `contracts/` | Solidity 0.8.34, OpenZeppelin 5, Hardhat 3 | ✅ 17 test, 100% coverage, đã deploy + verify |
| `frontend/` | React 19, Vite, TypeScript, Tailwind 4, ethers 6, MetaMask | ✅ Transfer / Approve / TransferFrom / Mint / Burn |
| `backend/` | Node, Express 5, Prisma, PostgreSQL, ethers 6 | 🟡 Code xong, cần DB để chạy |
| `docs/` | Tài liệu, test case | 🟡 |

**Contract Sepolia:** [`0x4D7b251399E5B8Db210Ad2C722B48c6c3A07f795`](https://sepolia.etherscan.io/address/0x4D7b251399E5B8Db210Ad2C722B48c6c3A07f795#code) (block 11956531)

## Chạy nhanh

```bash
# 1. Contracts
cd contracts && npm install
npx hardhat test                 # 17 test
npx hardhat test --coverage

# 2. Frontend
cd ../frontend && cp .env.example .env && npm install && npm run dev   # http://localhost:5173

# 3. Backend (cần PostgreSQL – xem backend/README.md)
cd ../backend && cp .env.example .env && npm install
npx prisma migrate dev --name init && npm run dev                      # http://localhost:4000
```

## Kiến trúc

```
MetaMask ──► Frontend (React) ──ghi/đọc──► TokenForge.sol (Sepolia)
                 │                                │ events
                 └──REST──► Backend API ◄── Indexer ┘
                                 │
                            PostgreSQL
```

## Lộ trình

1. ✅ Contract  2. ✅ Test contract  3. ✅ Deploy Sepolia + verify  4. ✅ Frontend
5. 🟡 Backend API  6. 🟡 Indexer  7. ⬜ Tích hợp FE↔BE  8. ⬜ System test
9. ⬜ Deploy (Vercel + Render/Railway + Neon)  10. ⬜ Báo cáo / tài liệu
