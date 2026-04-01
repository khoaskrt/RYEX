# [Assets] - FE-03 Error Copy Mapping (v1.0)

## 1) Scope
- Route: `/app/assets`
- Goal: Chuẩn hóa hiển thị lỗi theo `error.code` từ assets API.

## 2) Mapping Table
| `error.code` / condition | UI message |
|---|---|
| `ASSET_UNAUTHORIZED` | `Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.` |
| `ASSET_FETCH_FAILED` | `Không thể tải dữ liệu tài sản lúc này. Vui lòng thử lại sau.` |
| HTTP `401` fallback | `Bạn cần đăng nhập để xem tài sản.` |
| Unknown error | `Không thể tải dữ liệu tài sản.` |

## 3) Behavior Notes
- Ưu tiên mapping theo `error.code` trước, fallback theo `status`.
- Không đổi flow API call; chỉ chuẩn hóa user-facing copy.

## 4) Source Files
- `src/app/(webapp)/app/assets/page.js`
