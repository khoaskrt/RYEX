# [Assets] - FE Mapping + UX States (v1.0)

## 1) Scope
- Task: `FE-01` + `FE-02`
- Route: `/app/assets`
- API source: `GET /api/v1/user/assets`

## 2) FE-01: API -> UI Mapping Matrix
| API Field | UI Consumer | Render behavior |
|---|---|---|
| `totalBalanceBTC` | Hero total balance | Hiển thị số dư tổng theo BTC ở tiêu đề chính |
| `totalBalanceUSDT` | Hero subtitle | Hiển thị quy đổi `≈ ... USDT` |
| `fundingAccount.balanceBTC` | Funding card | Hiển thị số dư BTC của tài khoản tài trợ |
| `fundingAccount.balanceUSDT` | Funding card | Hiển thị quy đổi USDT của funding |
| `tradingAccount.balanceBTC` | Trading card | Hiển thị số dư BTC của tài khoản giao dịch |
| `tradingAccount.balanceUSDT` | Trading card | Hiển thị quy đổi USDT của trading |
| `assets[]` | Assets table | Render danh sách từng asset theo row |
| `asset.symbol` | Assets table | Cột tên tài sản + fallback ký tự đầu |
| `asset.name` | Assets table | Subtitle tài sản |
| `asset.balance` | Assets table | Cột số dư |
| `asset.price` | Assets table | Cột giá |
| `asset.valueUSDT` | Assets table | Cột giá trị USDT |
| `asset.iconUrl` | Assets table icon | Có URL thì render icon 24x24 tròn; không có thì fallback ký tự |
| `fetchedAt` | Internal/state trace | Giữ trong payload, hiện chưa hiển thị trực tiếp lên UI |

## 3) FE-02: UX States Completion
### 3.1 Loading state
- Condition: `isLoadingAssets = true`
- UX: Hiển thị `Đang tải dữ liệu tài sản...`

### 3.2 Error state
- Condition: `assetsError` có giá trị và không loading
- UX: Hiển thị message lỗi + nút `Thử lại`

### 3.3 Empty state (portfolio empty)
- Condition: `assetsData.assets.length = 0`
- UX: Hiển thị `Chưa có tài sản` + CTA `Nạp tiền ngay`

### 3.4 No-result state (filter/search active)
- Condition: có dữ liệu gốc nhưng `filteredAssets.length = 0` do search/filter
- UX: Hiển thị `Không tìm thấy tài sản phù hợp` + hướng dẫn đổi từ khóa/tắt bộ lọc

## 4) FE Notes
- Không đổi contract API hiện tại.
- Không chỉnh BE/service/repository.
- Token icon rule được giữ: `h-6 w-6`, `rounded-full`, wrapper `bg-transparent`.
