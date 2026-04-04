# RYEX — Mục lục tài liệu (điểm vào cho người & AI)

Đọc file này trước khi quét cả repo. Code chạy nằm dưới `src/`; **spec & SoT** ưu tiên dưới `docs/` và `db/`.

**Trước khi tạo file `.md` mới:** [`DOCUMENTATION_SCOPE.md`](./DOCUMENTATION_SCOPE.md) (đúng thư mục theo loại nội dung — tránh sai phạm vi).

## Hệ thống & kiến trúc
| Nội dung | Đường dẫn |
|----------|-----------|
| Sơ đồ hệ thống | [`00-system-map.md`](./00-system-map.md) |
| Quyết định kiến trúc | [`01-architecture-decisions.md`](./01-architecture-decisions.md) |
| API contract | [`contracts/api-v1.md`](./contracts/api-v1.md) |

## Domain (source of truth dữ liệu & nghiệp vụ)
| Domain | File |
|--------|------|
| Data / DB / RLS | [`domain/data-sot.md`](./domain/data-sot.md) |
| Auth | [`domain/auth-sot.md`](./domain/auth-sot.md) |
| Profile | [`domain/profile-sot.md`](./domain/profile-sot.md) |
| Market | [`domain/market-sot.md`](./domain/market-sot.md) |

## Database (kỹ thuật)
| Nội dung | Đường dẫn |
|----------|-----------|
| Thứ tự migration & hai track Supabase/legacy | [`../db/README.md`](../db/README.md) |
| Snapshot từng bảng | [`../db/schema/`](../db/schema/) |

## Feature docs (theo module)
| Module | Thư mục |
|--------|---------|
| Wallet (API, QA contract, E2E) | [`features/Wallet/`](./features/Wallet/) |
| Withdraw (UI/design) | [`features/Withdraw/`](./features/Withdraw/) |
| Assets, Auth, Profile, … | [`features/`](./features/) |

## Kế hoạch & thiết kế thô
| Loại | Đường dẫn |
|------|-----------|
| Plan sản phẩm (ví dụ deposit/withdraw) | [`plans/`](./plans/) |
| Export Stitch / HTML landing | [`design/landing-stitch/`](./design/landing-stitch/) |

## Vận hành
| Nội dung | Đường dẫn |
|----------|-----------|
| Runbooks | [`runbooks/`](./runbooks/) |
| Retrospective (multi-agent, docs, DB) | [`retrospectives/`](./retrospectives/) |

## Agent / Codex
| Nội dung | Đường dẫn |
|----------|-----------|
| Quy tắc workflow repo | [`../AGENTS.md`](../AGENTS.md) |
| Skill & rule | [`../.codex/Skill/`](../.codex/Skill/), [`../.codex/Rule/`](../.codex/Rule/) |
| Dev workflow (Codex) | [`../.codex/dev-workflow.md`](../.codex/dev-workflow.md) |

## Incident / postmortem (tài liệu, không nằm trong `.codex`)
| Nội dung | Đường dẫn |
|----------|-----------|
| Auth signup 500, SSL, migration (2026-04-03) | [`runbooks/incidents/`](./runbooks/incidents/) |

## Code — map nhanh
| Layer | Đường dẫn |
|-------|-----------|
| App Router & API | `src/app/` |
| Domain server | `src/server/` |
| Feature UI | `src/features/` |
| Shared | `src/shared/` |
| Script DB / tool | [`../scripts/README.md`](../scripts/README.md) |

## Static assets
- Ảnh/icon phục vụ web: **`public/images/`** (URL `/images/...`). Không dùng thư mục `images/` ở root repo.
