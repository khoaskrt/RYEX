# Phạm vi & nơi đặt tài liệu (bắt buộc đọc trước khi thêm file `.md`)

Mục tiêu: **mỗi loại nội dung chỉ một chỗ** — tránh agent/role “tiện tay” ghi vào thư mục sai, gây drift và tốn token khi tìm.

## 1) Bảng quyết định nhanh

| Loại nội dung | Đặt tại | **Không** đặt tại |
|---------------|---------|-------------------|
| Spec / AC / QA matrix / release gate / handoff FE-BE-QA | `docs/features/<Module>/` | `src/features/` (trừ `README.md` pointer), `.codex/`, root repo |
| Domain SoT (data, auth, profile, market) | `docs/domain/` | `db/schema` alone (schema = kỹ thuật; SoT = nghiệp vụ + lineage) |
| Snapshot cột bảng, RLS note | `db/schema/*.md` | `docs/features` (trùng vai trò với schema snapshot) |
| Thứ tự migration, track Supabase vs legacy | `db/README.md` | Comment dài trong từng file SQL thay cho README (được phép comment ngắn) |
| Plan sản phẩm, roadmap dạng narrative | `docs/plans/` | `plans/` ở root (đã bỏ pattern cũ) |
| HTML/Stitch/export thiết kế tĩnh | `docs/design/<tên>/` | `src/features/**/stitch-source/` |
| Incident / postmortem / báo cáo sự cố | `docs/runbooks/incidents/` | `.codex/`, `docs/features` |
| Retrospective, meta-process | `docs/retrospectives/` | `.codex/` |
| Skill / rule / workflow cho Codex agent | `.codex/Skill/`, `.codex/Rule/`, `.codex/dev-workflow.md` | Bất kỳ báo cáo dài không phải rule |
| Hướng dẫn vận hành chung | `docs/runbooks/` | File rời ở root |

## 2) Quy ước trình bày & đặt tên

- **Tên file:** `NNN-short-title-vX.Y.md` trong `docs/features/<Module>/` (`NNN` = thứ tự đọc gợi ý; `vX.Y` = phiên bản tài liệu).
- **Một feature = một thư mục** dưới `docs/features/`; không tạo thư mục con lẻ từng file ngoài pattern đã có (trừ khi BA chốt).
- **Không** thêm file markdown mới ở **root** ngoài `README.md`, `AGENTS.md` (đã có).
- **Trỏ chéo:** từ doc feature, link tới `docs/domain/*-sot.md` hoặc `db/README.md` thay vì copy đoạn dài.

## 2.1) Đánh số & version — **không trộn** các lớp (quan trọng)

| Lớp | Đánh số / version | Ghi chú |
|-----|-------------------|---------|
| **Tài liệu feature** (`docs/features/`) | `NNN-...-vX.Y.md` | `NNN` = thứ tự đọc trong module; **`vX.Y` chỉ version của file tài liệu** (sửa nhỏ → tăng `Y`; đổi cấu trúc/AC lớn → tăng `X`). **Không** gán `NNN` trùng nghĩa với số migration. |
| **Migration SQL** (`db/migrations/`) | `001.1_...`, `006_...`, … | Thứ tự apply & ý nghĩa `001.x`: **`db/README.md`**. Đây là **schema DB**, không dùng cùng quy tắc `NNN` với doc feature. |
| **Rule** (`.codex/Rule/rule_<role>.md`) | Tiêu đề `# ... — vA.B` + `version: A.B` trong YAML frontmatter | Hai chỗ **phải khớp**. Đổi rule bắt buộc → bump version + mục **Changelog** cuối file. Tên file **cố định** theo role — **không** dùng prefix `NNN-` kiểu feature doc. |
| **Skill** (`.codex/Skill/skill_<role>.md`) | `version:` trong frontmatter (+ tiêu đề có thể ghi `— vA.B`) | Skill = *cách làm*; Rule = *cùng nguồn ràng buộc*. Khi đổi workflow/skill → bump version + changelog ngắn nếu có. |

**Tóm tắt cho agent:** số `001` trong migration **khác** số `001` trong `docs/features/Wallet/001-...md`; version `v1.2` trong tên file feature **khác** `rule_be` v1.3.

## 3) Trước khi merge PR có thêm `.md`

Checklist (copy vào PR description khi đụng doc):

- [ ] File nằm đúng hàng trong bảng mục (1).
- [ ] Đã thêm **một dòng** vào `docs/INDEX.md` nếu là loại tài liệu mới hoặc thư mục mới.
- [ ] Không nhân đôi nội dung đã có ở `docs/features` sang `src/features` (chỉ cập nhật `README.md` pointer nếu cần).

## 4) AI / agent

- Đọc **`docs/INDEX.md`** và file này **trước** khi tạo hoặc sửa tài liệu, và **trước** khi bắt đầu tác vụ có thể chạm tới cấu trúc repo hoặc đường dẫn trong doc (xem **§5**).
- Nếu không chắc: **mặc định `docs/features/<Module>/`** cho nội dung sản phẩm; hỏi PO/BA khi là meta-doc (retrospective, ADR).
- Khi làm việc theo role (`BE`, `BA`, `QA`, `FE`, UI/UX): đọc thêm **`.codex/Rule/rule_<role>.md`** và **`.codex/Skill/skill_<role>.md`** — các file đó có mục **Documentation placement** trùng với bảng mục (1) ở đây.
- Khi đổi **tên file feature** hoặc **version rule/skill**: xem **§2.1** để không lẫn migration vs doc vs rule.

## 5) Sau khi đổi cấu trúc thư mục (bắt buộc rà soát)

Mỗi lần **di chuyển, đổi tên, hoặc gom thư mục** (docs, `src/`, `db/`, v.v.), người merge / agent phải **rà lại mọi tham chiếu đường dẫn** trong tài liệu — không chỉ `docs/INDEX.md`.

Checklist tối thiểu:

- [ ] Tìm trong `docs/` (và nơi có link `.md` khác nếu có) các chuỗi trỏ tới path cũ: `grep`/search theo tên thư mục hoặc file đã đổi.
- [ ] Sửa **link Markdown** (`[text](path)`) và đường dẫn trong backtick nếu path đã đổi; nhớ **đếm đúng** `../` theo độ sâu file (ví dụ `docs/runbooks/incidents/*.md` → root = `../../../`).
- [ ] Cập nhật **`docs/INDEX.md`** nếu thêm/bớt nhóm tài liệu hoặc đổi vị trí mục lớn.
- [ ] Tránh `file:///...` hoặc đường dẫn tuyệt đối máy local; dùng path tương đối từ file doc tới repo hoặc mô tả rõ “repo root: …”.
- [ ] (Khuyến nghị) Ghi một dòng trong retrospective hoặc mô tả PR: “đã rà link sau đổi cấu trúc”.

---

*Đồng bộ với `docs/retrospectives/2026-04-04-multi-agent-collaboration.md` (mục 7–8). §2.1 bổ sung logic đánh số/version (2026-04-04). §5 bổ sung rà path sau đổi cấu trúc (2026-04-04).*
