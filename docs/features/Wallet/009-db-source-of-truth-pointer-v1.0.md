# Wallet / Data layer — pointer tới SoT (v1.0)

## Mục đích
Tập trung tài liệu schema + migration + RLS tại domain và `db/`, tránh trùng lặp nội dung dài trong từng feature doc.

## Nguồn sự thật
- Thứ tự migration (Track Supabase vs legacy): [`db/README.md`](../../../db/README.md)
- Schema map, RACI, RLS tóm tắt: [`docs/domain/data-sot.md`](../../domain/data-sot.md)
- Snapshot từng bảng: [`db/schema/`](../../../db/schema/)

## Verify
- `npm run db:verify` — bảng bắt buộc + `trusted_devices` optional (xem script).
