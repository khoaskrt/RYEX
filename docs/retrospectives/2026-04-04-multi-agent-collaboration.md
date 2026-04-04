# Retrospective — AI collaboration, docs & DB hygiene (2026-04-04)

**Bối cảnh:** Nhiều agent (Codex, Cursor, Claude) cùng chỉnh repo; Product Owner phản ánh lệch giữa DB, migration, tài liệu, và cấu trúc thư mục.

**Mục tiêu retrospective:** Ghi nhận complaint, nguyên nhân gốc, việc đã làm, và **quy ước** để giảm lặp lỗi + giảm tốn token/thời gian cho lần sau.

---

## 1) Tổng hợp complaint từ PO (đã xử lý / đang theo dõi)

| Chủ đề | Nội dung phản ánh | Trạng thái |
|--------|-------------------|------------|
| **BE / product** | Testnet vs mainnet, token & chain đang hỗ trợ | Đã làm rõ từ `src/server/wallet/constants.js` (MVP: `bsc_testnet`, `USDT`). |
| **DB / Supabase** | Dữ liệu đã log đủ chưa; RLS đã bật chưa | Đã giải thích: schema có trong migration; `db:verify` trước đây chỉ check một phần; RLS không đồng nhất mọi bảng (auth/ops có thể UNRESTRICTED). |
| **Schema vs thực tế** | Nhiều bảng trên Supabase không có trong `db/schema/` / SoT | Đã bổ sung snapshot + `data-sot` + README migration; quy ước `001.1` / `001.2` tránh trùng số. |
| **Số migration** | Hai file `001_*`, hai `003_*` — khó trace | Đã rename nhánh `001.1`, `001.2`, `002.x`, `003.x` + cập nhật doc. |
| **Cây thư mục** | Không đồng bộ, trùng doc/asset, tốn token khi AI quét cả cây | Đã: `docs/INDEX.md`, README root, gom `plans/` + stitch vào `docs/`, xóa `images/` trùng ở root, pointer `src/features` → `docs/features`. |
| **`.codex/`** | File incident không phải skill/rule | Đã chuyển sang `docs/runbooks/incidents/`. |
| **Sai phạm vi thư mục** | Role/agent tự thêm tài liệu ngoài đúng “nhánh” chức năng (vd: spec dài trong `src/features`, incident trong `.codex`, plan ở root) | Đã ghi nhận; **solution:** [`docs/DOCUMENTATION_SCOPE.md`](../DOCUMENTATION_SCOPE.md) + checklist PR + mục 7–8 dưới đây. |
| **Trình bày & cây tài liệu** | Tên file, trùng thư mục, thiếu mục lục cập nhật → khó tìm, tốn token | Đã có `docs/INDEX.md`; bổ sung scope doc + quy ước đặt tên trong `DOCUMENTATION_SCOPE.md`. |

---

## 2) Góc nhìn theo role (synthetic retrospective)

### BA / Product
- **Thấy gì:** SoT (`data-sot`) từng chỉ mở rộng dần (Assets → Wallet) nên **bản đồ migration + RLS** không theo kịp một lúc → PO thấy “lệch dashboard vs doc”.
- **Cần cải thiện:** Mỗi feature chốt DB: **một dòng** trong migration map + owner review SoT trong cùng sprint (không để backlog doc).
- **Tránh lãng phí:** PO hỏi “đã support chain gì” → trả lời nên **trỏ một file** (`constants` + contract doc) thay vì agent đọc cả repo.

### BE
- **Thấy gì:** Hai track migration (Supabase vs legacy Firebase) trong cùng thư mục → dễ apply nhầm; script `apply-all` lịch sử không phản ánh Track A.
- **Cần cải thiện:** `db/README.md` là **thứ tự apply duy nhất**; mọi script apply phải align hoặc ghi rõ deprecated; đổi schema → **migration + `db/schema/*.md` + một dòng SoT** (đã cập nhật rule trong `skill_be`).
- **Token/thời gian:** Agent không cần `glob` cả `src/` — vào `src/server/<domain>` + `db/migrations` theo INDEX.

### DB / Infra
- **Thấy gì:** RLS “UNRESTRICTED” trên dashboard là **hợp lệ** với bảng server-only nếu đã chốt; nhưng phải **ghi rõ** trong SoT để không hiểu nhầm là thiếu bảo mật.
- **Cần cải thiện:** Policy legacy (`005` Firebase JWT) không áp trực tiếp Supabase — cần ticket riêng nếu bật RLS auth bằng `auth.uid()`.

### QA
- **Thấy gì:** Matrix / E2E doc từng nhân đôi dưới `src/features` → drift với `docs/features`.
- **Cần cải thiện:** Gate release: **`npm run db:verify`** trên env target; evidence chỉ link file trong `docs/features/...`.
- **Skill:** `skill_qa` nên coi `docs/INDEX.md` là điểm vào khi cần bối cảnh cross-module.

### FE
- **Thấy gì:** Asset trùng `images/` vs `public/images/` gây nghi ngờ file nào là nguồn sự thật.
- **Cần cải thiện:** Chỉ **`public/images`** cho URL `/images/...`; không thêm bản sao ở root.

### “Agent ops” (chung cho Codex / Cursor / Claude)
- **Thấy gì:** Incident report nằm trong `.codex` làm **lẫn vai trò** thư mục agent vs tài liệu người.
- **Cần cải thiện:** Mọi postmortem → `docs/runbooks/incidents/`; `.codex` chỉ Skill, Rule, `dev-workflow` (và tương đương).

### Góc nhìn chung — **tự ý thêm doc sai chỗ**
- **Thấy gì:** Mọi role (kể cả khi làm qua AI) có xu hướng **ghi file tiện tay** vào thư mục đang mở: `.codex/`, `src/features/`, root, hoặc nhân đôi bản đã có ở `docs/features/`.
- **Hậu quả:** PO và reviewer không biết **đâu là canonical**; agent lần sau đọc **nhánh sai** hoặc phải `grep` cả repo → **tốn token và thời gian**.
- **Cần cải thiện:** Một bản **phạm vi cố định** ([`docs/DOCUMENTATION_SCOPE.md`](../DOCUMENTATION_SCOPE.md)) + checklist PR; BA/PO có quyền **reject** PR chỉ vì sai vị trí file doc (nếu team chấp nhận gate này).

---

## 3) Nguyên nhân gốc (5 Whys gọn)

1. Nhiều agent/session không share **một quy ước đặt file** trước khi chỉnh.
2. Thiếu **một mục lục** (`docs/INDEX.md`) → model đọc lan man hoặc grep rộng.
3. Migration **lịch sử** (legacy + mới) trong cùng folder **không được đặt tên phân nhánh** sớm.
4. Rule “sync `docs/features` + `src/features`” **không khả thi** với file dài → drift.
5. **Không có bảng “được phép / cấm”** theo loại tài liệu → mỗi người đặt chỗ khác nhau.

---

## 4) Thỏa thuận để tránh lặp (working agreements)

| # | Thỏa thuận | Ai nhắc |
|---|------------|---------|
| W1 | Spec/QA/handoff dài chỉ ở **`docs/features/`**; `src/features/*/README.md` chỉ pointer | BE + BA |
| W2 | Đổi DB: **migration → schema md → `data-sot` / README** trong cùng PR | BE |
| W3 | **Không** nhân đôi `001_*`; dùng **`001.1`, `001.2`, …** nếu cùng mốc | BE |
| W4 | Static web: chỉ **`public/images/`** | FE |
| W5 | Incident / postmortem: chỉ **`docs/runbooks/incidents/`** | QA + anyone |
| W6 | Agent đọc **`docs/INDEX.md` trước** khi explore cây repo | All |
| W7 | Mọi tài liệu mới phải khớp **[`docs/DOCUMENTATION_SCOPE.md`](../DOCUMENTATION_SCOPE.md)** (đúng thư mục theo loại) | All + PR reviewer |
| W8 | PR có thêm `.md`: checklist 3 mục trong `DOCUMENTATION_SCOPE.md` §3 | Author PR |
| W9 | Không tạo file spec/QA dài mới dưới **`src/features/`**, **`.codex/`** (ngoại trừ Skill/Rule), **root** | All |

---

## 5) Hành động theo dõi (backlog gọn)

- [ ] Rà soát một lần **RLS** cho bảng auth/ops: chốt “server-only” vs policy Supabase (owner BE + Infra).
- [ ] Migration **`trusted_devices`** FK tới `users(users_id)` nếu cần feature đầy đủ (đã ghi trong schema note).
- [ ] (Tùy chọn) Rule Cursor ngắn trỏ tới `docs/INDEX.md` + `docs/DOCUMENTATION_SCOPE.md` để giảm scan.
- [ ] PO/BA: dùng **W7–W9** làm tiêu chí reject/comment PR khi doc sai chỗ (nếu team adopt).

---

## 6) Kết luận ngắn

Complaint của PO hợp lý: **lệch giữa runtime (Supabase), migration, và tài liệu** + **cấu trúc thư mục do nhiều agent** làm tăng chi phí review và token. Đã có **INDEX**, **chuẩn hóa migration naming**, **tách incident khỏi `.codex`**, và **rule BE** cập nhật để không nhân đôi spec trong `src/features`. Giữ kỷ luật W1–W6 trong vài sprint tới sẽ giảm tái diễn.

**Bổ sung (cùng phiên):** Ghi nhận thêm hiện tượng **tự ý thêm tài liệu sai phạm vi thư mục** và **trình bày/cây mục lục chưa tối ưu**. **Solution:** file **[`docs/DOCUMENTATION_SCOPE.md`](../DOCUMENTATION_SCOPE.md)** (bảng cho phép/cấm + quy ước tên + checklist PR) và thỏa thuận **W7–W9**.

---

## 7) Sai phạm vi & trình bày — tóm tắt cho PO

| Vấn đề | Giải pháp đã đưa vào repo |
|--------|---------------------------|
| Spec/QA/incident đặt nhầm `.codex`, `src/features`, root | `DOCUMENTATION_SCOPE.md` — bảng “loại nội dung → đường dẫn” |
| Không biết file nào là chính | `docs/INDEX.md` + chỉ một nguồn `docs/features` cho spec dài |
| Tên file / thư mục lộn xộn | Quy ước `NNN-title-vX.Y.md` và “một feature = một folder” trong scope doc |
| Lặp lại khi merge | Checklist §3 trong `DOCUMENTATION_SCOPE.md` (copy vào PR) |

---

## 8) Solution (hành động cụ thể cho team)

1. **Bắt buộc đọc:** [`docs/DOCUMENTATION_SCOPE.md`](../DOCUMENTATION_SCOPE.md) trước khi tạo bất kỳ file `.md` mới.
2. **PR:** Nếu thêm/sửa doc — dán checklist 3 dòng (§3 của scope doc) vào mô tả PR.
3. **Review:** Reviewer (BA hoặc PO delegate) kiểm **W7** (đúng thư mục theo bảng).
4. **Cursor/Codex rule (khuyến nghị):** Một rule ngắn: “New markdown → must match `docs/DOCUMENTATION_SCOPE.md`”.
5. **Không tái diễn:** Mọi retrospective / meta chỉ dưới `docs/retrospectives/`, không tạo file loại đó trong `.codex/`.

---

*Ghi nhận retrospective đồng bộ với các thay đổi repo trong phiên 2026-04-04; cập nhật mục 7–8 và `DOCUMENTATION_SCOPE.md` cùng ngày.*
