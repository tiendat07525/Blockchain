# Phase 4 – Test case thủ công cho Frontend

**Môi trường:** Chrome/Firefox + MetaMask, mạng Sepolia, `npm run dev` trong `frontend/`.
**Chuẩn bị:** 2 ví – **Ví A** = owner (`0x2631…1f2a`), **Ví B** = ví thường; cả hai có ít Sepolia ETH.
Contract: `0x4D7b251399E5B8Db210Ad2C722B48c6c3A07f795`.

Ghi kết quả vào cột *KQ* (✅ / ❌ + ghi chú, ảnh chụp nếu lỗi).

## 1. Kết nối ví & mạng

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| W-01 | Mở trang trên trình duyệt **không** có MetaMask | Hiện nút "Cài MetaMask" + thông báo chưa phát hiện MetaMask | |
| W-02 | Có MetaMask, chưa kết nối → bấm "Kết nối MetaMask" → Connect | Header hiện địa chỉ rút gọn `0x…`, hiện thẻ số dư | |
| W-03 | Bấm kết nối rồi **Cancel** trong MetaMask | Báo "Bạn đã từ chối kết nối", không crash | |
| W-04 | Đổi MetaMask sang mạng khác (Mainnet/Holesky) | Hiện cảnh báo sai mạng + nút "Chuyển sang Sepolia", các form bị ẩn | |
| W-05 | Bấm "Chuyển sang Sepolia" | MetaMask hỏi đổi mạng; sau khi đồng ý cảnh báo biến mất, dữ liệu tải lại | |
| W-06 | Đổi tài khoản trong MetaMask (A → B) | Địa chỉ, số dư, badge Owner cập nhật mà không cần F5 | |
| W-07 | Reload trang khi đã kết nối trước đó | Tự nhận ví (không phải bấm kết nối lại) | |

## 2. Hiển thị thông tin token

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| I-01 | Kết nối Ví A | Name = TokenForge, Symbol = TFG, Tổng cung đúng như Etherscan, badge **Owner** | |
| I-02 | Kết nối Ví B | Không có badge Owner, **không** thấy form Mint | |
| I-03 | Bấm link Contract | Mở trang token trên sepolia.etherscan.io đúng địa chỉ | |

## 3. Transfer

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| T-01 | Nhập địa chỉ sai (`0x123`) | Báo "Địa chỉ không hợp lệ", nút Gửi disabled | |
| T-02 | Nhập số lượng `0`, `-1`, `abc` | Báo lỗi số lượng, nút disabled | |
| T-03 | Nhập số lượng > số dư | Báo "Vượt quá số dư" | |
| T-04 | A chuyển 10 TFG cho B → Confirm | Toast: "Vui lòng xác nhận…" → "Đang chờ…" (có link Etherscan) → "Thành công"; số dư A giảm 10 | |
| T-05 | Lặp T-04 nhưng **Reject** trong MetaMask | Toast đỏ "Bạn đã từ chối giao dịch", số dư không đổi | |
| T-06 | Trong lúc giao dịch đang mining | Mọi nút gửi bị disabled (không gửi trùng) | |
| T-07 | Chuyển số thập phân `0.5` | Thành công, số dư hiển thị đúng phần lẻ | |

## 4. Approve / Allowance / TransferFrom

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| A-01 | A approve B 100 TFG | Giao dịch thành công | |
| A-02 | A bấm "Xem allowance" với spender = B | Hiện 100 TFG | |
| A-03 | Đổi sang Ví B → TransferFrom: from = A, to = B, nhập địa chỉ from rồi rời ô | Hiện "Allowance bạn được dùng: 100" | |
| A-04 | B transferFrom 30 TFG từ A sang B | Thành công; số dư B +30; allowance còn 70 | |
| A-05 | B transferFrom 1000 TFG (> allowance) | Form báo "Vượt quá allowance" | |
| A-06 | A approve B = 0 | Allowance về 0 (thu hồi quyền) | |

## 5. Mint (owner)

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| M-01 | Ví A mint 500 TFG cho B | Thành công; tổng cung +500; số dư B +500 | |
| M-02 | Gọi mint bằng Ví B (qua console/Etherscan "Write contract") | Revert `OwnableUnauthorizedAccount` | |
| M-03 | Mint địa chỉ sai / số lượng 0 | Form báo lỗi, nút disabled | |

## 6. Burn

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| B-01 | B burn 10 TFG → hộp xác nhận → OK → MetaMask Confirm | Thành công; số dư B −10; tổng cung −10 | |
| B-02 | Bấm Burn rồi **Cancel** ở hộp xác nhận | Không mở MetaMask, không có giao dịch | |
| B-03 | Burn > số dư | Form báo "Vượt quá số dư" | |

## 7. Lịch sử giao dịch (cần backend – Phase 5/6)

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| H-01 | Không đặt `VITE_API_URL` | Không hiện khung lịch sử | |
| H-02 | Đặt `VITE_API_URL`, backend tắt | Báo "Không tải được lịch sử từ backend", phần còn lại vẫn dùng được | |
| H-03 | Backend + indexer chạy, thực hiện 1 transfer | Sau khi indexer bắt kịp (vài block), giao dịch xuất hiện với nhãn, số lượng, link Etherscan | |

## 8. Phi chức năng

| ID | Bước | Kết quả mong đợi | KQ |
|---|---|---|---|
| N-01 | Thu nhỏ cửa sổ về ~375px | Layout 1 cột, không tràn ngang | |
| N-02 | `npm run lint` | Không lỗi | |
| N-03 | `npm run build` | Build thành công | |
| N-04 | Mở DevTools Console khi dùng các luồng trên | Không có lỗi đỏ chưa xử lý | |
