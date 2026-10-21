# TokenForge Backend (Phase 5–6)

REST API + indexer đọc event `Transfer` / `Approval` của contract TFG trên Sepolia và lưu vào PostgreSQL.

## Cài đặt

```bash
cd backend
cp .env.example .env        # điền DATABASE_URL, RPC_URL
npm install                 # tự chạy prisma generate
npx prisma migrate dev --name init   # tạo bảng
npm run dev                 # API :4000 + indexer (RUN_INDEXER=true)
```

Chạy indexer tách riêng: đặt `RUN_INDEXER=false` rồi mở terminal khác `npm run indexer`.

## Cách indexer hoạt động

- Bắt đầu từ `DEPLOY_BLOCK`, quét `eth_getLogs` theo lô `BATCH_SIZE` block, chỉ tới `head - CONFIRMATIONS` để tránh reorg.
- Mỗi lô ghi event + cập nhật số dư `Holder` + con trỏ `SyncState` trong **cùng một transaction DB** → dừng giữa chừng rồi chạy lại không bị đếm trùng.
- Event được khoá duy nhất theo `(txHash, logIndex)`.

## API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/health` | Trạng thái DB, block đã index, độ trễ so với chain |
| GET | `/api/token` | name, symbol, decimals, totalSupply, owner (on-chain, cache 30s) |
| GET | `/api/stats` | Số giao dịch, số holder, tổng mint/burn |
| GET | `/api/transfers?type=MINT\|BURN\|TRANSFER&address=0x..&page=&limit=` | Danh sách transfer |
| GET | `/api/transfers/:txHash` | Các event trong 1 giao dịch |
| GET | `/api/accounts/:address` | Số dư (theo index) + số lần gửi/nhận |
| GET | `/api/accounts/:address/transfers` | Lịch sử của 1 ví (frontend dùng) |
| GET | `/api/holders?page=&limit=` | Top holder |
| GET | `/api/approvals?owner=&spender=` | Lịch sử approve |

Trường `value` là wei (chuỗi), `amount` là số token đã chia 10^18.
