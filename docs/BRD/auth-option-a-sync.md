# Auth Option A — BRD / Plan đồng bộ (MVP)

Tài liệu này là **single source of truth** cho Option A (verify bắt buộc, login email-link + trusted device 30 ngày, resend có cooldown/cap). Cập nhật theo **ba-crypto-mvp** và chốt PO.

---

## A. Problem framing

- **Business goal:** User hoàn tất **đăng ký → verify email → đăng nhập**; **tài khoản được lưu trong DB** nội bộ; vào khu vực app (vd. `/app/market`) chỉ khi email đã verify và session hợp lệ theo contract Option A.
- **User pain:** Không nhận/không hiểu email verify hoặc login challenge; UI gợi có tính năng (OAuth, referral, SĐT) nhưng không chạy → mất niềm tin onboarding.
- **KPI (mục tiêu đo lường):**
  - `signup_submit → email_verified` ≥ 55% (điều chỉnh theo dữ liệu thực tế sau sprint đầu).
  - `login_start → login_success` ≥ 85% (trusted), ≥ 70% (không trusted) — tham chiếu.
  - `resend_click → resend_success` ≥ 95%.
  - Auth technical error rate dưới 2% sessions (staging/prod).

---

## B. Assumptions

- PO chốt **Option A**: login mặc định **email-link challenge** mỗi lần, **trừ** khi **trusted device** còn hiệu lực (30 ngày).
- **Verify email bắt buộc** trước khi vào `/app/market` (hoặc route app được PO liệt kê).
- Trusted device gắn **user + device id** (cookie ký + DB) theo triển khai BE hiện tại; không mở rộng fingerprint nâng cao trong MVP.
- Resend: cooldown **60s**, cap **5 lần/giờ/email** (signup verify + login challenge/resend theo contract API).
- **PO chốt: Logout không bắt buộc trong MVP** — API logout có thể tồn tại cho dev/QA hoặc sau MVP; không đưa logout UI vào DoD MVP.
- UX signup: **không** nav kiểu landing; logo RYEX về `/`; defect dải đen header/footer → backlog defect (skill ba-crypto-mvp).

---

## C. Scope MVP vs post-MVP

### MVP (must-have — đủ để ship luồng PO)

- Signup email/password → lưu user + identity trong DB → gửi / hướng dẫn verify email.
- Verify qua link → đồng bộ session (cookie) → vào app khi đủ điều kiện verify + session.
- Login: challenge email-link; trusted bypass trong TTL; resend có cooldown + cap.
- Gate app (vd. market) theo session + `email_verified` (server-side).
- **UX trung thực:** không hiển thị nút/field “giả” (xem backlog **FE-AUTH-HONEST-***).

### Post-MVP (nâng cấp — không chặn MVP theo PO)

- Middleware tập trung cho mọi route `/app/*` (khi số trang nhạy cảm tăng).
- `GET /api/v1/auth/session` cho client.
- Rate limit **distributed** (Redis/DB) thay vì in-memory đơn instance.
- **Logout UI** và self-service revoke trusted device qua UI.
- Cooldown resend đồng bộ sau F5 (localStorage timestamp hoặc API).
- Email validation client chặt hơn (ngoài validate Firebase).
- Password reset, OAuth, phone auth, referral **khi PO đưa vào backlog**.
- Hiển thị `requestId` trên thông báo lỗi (hỗ trợ CS).
- Client-side polling session (bổ sung sau server guard).

---

## D. User stories

| ID | Story | Priority |
|----|--------|----------|
| **US-01** | Là user mới, tôi muốn đăng ký bằng email/password để có account và dữ liệu lưu trong hệ thống. | P0 |
| **US-02** | Là user mới, tôi muốn **bắt buộc verify email** trước khi vào app/market. | P0 |
| **US-03** | Là user đã verify, tôi muốn đăng nhập qua **email-link challenge** khi không có trusted device. | P0 |
| **US-04** | Là user thường xuyên, tôi muốn **trusted device 30 ngày** để giảm bước mở email lặp lại. | P0 |
| **US-05** | Là user chưa nhận mail, tôi muốn **resend** với giới hạn cooldown/cap rõ ràng. | P0 |
| **US-06** | Là user, tôi muốn trang signup/login **không gợi tính năng chưa có** (OAuth, referral, SĐT như đã bật). | P0 |
| **US-07** | Là user, tôi muốn trang signup đúng layout (không landing nav, logo về `/`). | P0 |
| **US-08** | *(Post-MVP)* Là user, tôi muốn **đăng xuất** từ UI để kết thúc phiên trên máy dùng chung. | P1 |

---

## E. Acceptance criteria (Given / When / Then)

### E.1 Luồng core (P0)

**AC-01 Signup tạo account + DB**  
- **Given** user ở `/app/auth/signup`, email hợp lệ, password đạt policy  
- **When** submit đăng ký  
- **Then** có bản ghi user (và identity liên quan) trong DB trạng thái chờ verify; UI báo đã gửi / cần kiểm tra email.

**AC-02 Chặn app khi chưa verify**  
- **Given** account chưa `email_verified`  
- **When** truy cập `/app/market` (hoặc route được gate)  
- **Then** redirect về auth kèm lý do (vd. `verify_required`).

**AC-03 Verify email thành công**  
- **Given** link verify hợp lệ  
- **When** callback xử lý xong + sync session  
- **Then** identity phản ánh verified; user vào được app theo redirect contract.

**AC-04 Login challenge (không trusted)**  
- **Given** user verified, không trusted còn hạn  
- **When** login  
- **Then** gửi email-link; chỉ hoàn tất sau khi mở link hợp lệ + sync session.

**AC-05 Trusted bypass**  
- **Given** trusted device còn hạn và khớp BE  
- **When** login cùng email  
- **Then** tạo session hợp lệ **không** yêu cầu gửi challenge mới (theo contract BE/FE).

**AC-06 Trusted hết hạn / revoke**  
- **Given** trusted hết hạn hoặc đã revoke  
- **When** login  
- **Then** quay về flow challenge.

**AC-07–AC-09 Resend**  
- Resend thành công có phản hồi rõ; trong 60s: UI hoặc API từ chối cooldown; sau 5 lần/giờ/email: từ chối cap với mã lỗi thống nhất.

**AC-10 Provider lỗi**  
- **Given** provider tạm lỗi  
- **When** signup / challenge / resend  
- **Then** không báo success giả; cho phép retry/resend khi hợp lệ.

**AC-11 UX signup constraints**  
- **Given** `/app/auth/signup`  
- **When** render  
- **Then** không nav landing; logo RYEX → `/`.

**AC-12 Dải đen layout**  
- Nếu có → defect riêng, severity theo QA; fix trước release nếu ảnh hưởng niềm tin onboarding.

### E.2 UX trung thực (P0 — bổ sung theo rà soát MVP)

**AC-13 Không referral “chết”**  
- **Given** MVP **không** có nghiệp vụ referral  
- **When** user mở signup  
- **Then** không có field mã giới thiệu **hoặc** field được ẩn hoàn toàn đến khi PO mở scope.

**AC-14 Không OAuth giả**  
- **Given** chưa tích hợp Google/Apple/Facebook  
- **When** user mở login/signup  
- **Then** không có nút như đã bật sẵn; nếu hiển thị thì **disabled + nhãn** (vd. “Sắp có”) — không click im lặng.

**AC-15 Tab SĐT**  
- **Given** phone auth chưa có  
- **When** render  
- **Then** không có tab/separator gợi đã có kênh SĐT; hoặc một dòng copy “Sắp có” ngoài tab.

**AC-16 Điều khoản / privacy**  
- **Given** user tick đồng ý điều khoản  
- **When** xem link  
- **Then** không dùng `href="#"` giả là trang pháp lý; **URL thật** hoặc copy rõ “Nội dung sẽ được công bố tại …” — **PO/legal chốt** trước release nếu có rủi ro compliance.

### E.3 Logout (ngoài DoD MVP)

**AC-17 (P1 / post-MVP)**  
- Logout từ UI: chỉ bắt buộc khi PO đưa **US-08** vào phạm vi release; **không** nằm trong Definition of Done MVP hiện tại.

---

## F. Backlog ưu tiên (P0 / P1 / P2)

| ID | Item | P | Effort | Dependency / ghi chú |
|----|------|---|--------|----------------------|
| BA-AUTH-01 | Chốt contract Option A + gate app | P0 | S | PO |
| BE-AUTH-01 | Signup + persist DB + verify path | P0 | M | Firebase + DB |
| BE-AUTH-02 | Gate app theo session + `email_verified` | P0 | M | BE-AUTH-01 |
| BE-AUTH-03 | Login challenge + session khi trusted/challenge | P0 | M/L | BE-AUTH-01 |
| BE-AUTH-04 | Trusted device 30d + revoke (API) | P0 | M/L | BE-AUTH-03 |
| BE-AUTH-05 | Resend + cooldown + cap | P0 | M | BE-AUTH-03 |
| FE-AUTH-01 | Signup states + errors | P0 | M | BE-AUTH-01 |
| FE-AUTH-02 | Login challenge + trusted UX | P0 | M | BE-AUTH-03,04 |
| FE-AUTH-03 | Resend UI + map lỗi cooldown/cap | P0 | M | BE-AUTH-05 |
| FE-AUTH-04 | Signup layout constraints + defect dải đen | P0 | S | Layout |
| **FE-AUTH-HONEST-01** | Ẩn/gỡ referral / OAuth giả / tab SĐT misleading | P0 | S | AC-13–15 |
| **FE-AUTH-HONEST-02** | Điều khoản & privacy: URL hoặc copy tạm PO/legal | P0 | S | AC-16 |
| QA-AUTH-01 | E2E signup → verify → login → trusted → gate | P0 | M | Staging |
| QA-AUTH-02 | Resend cooldown/cap + provider error | P0 | M | BE-AUTH-05 |
| ANA-AUTH-01 | Events funnel Option A | P1 | S/M | Instrumentation |
| **FE-AUTH-LOGOUT-01** | Nút logout + gọi API (chỉ khi PO bật US-08) | P1 | S | PO, API logout |
| AUTH-OPS-01 | Alerting provider / resend spike | P1 | S | Observability |
| AUTH-MW-01 | Middleware `/app` thống nhất | P2 | M | Nhiều route nhạy cảm |
| AUTH-API-01 | `GET /api/v1/auth/session` | P2 | M | Client state nâng cao |
| AUTH-RATE-01 | Rate limit Redis/DB | P2 | M | Scale multi-instance |
| AUTH-UX-01 | Cooldown persist sau F5 | P2 | S | Polish |
| AUTH-UX-02 | Email regex client chặt | P2 | S | Polish |
| AUTH-DEBT-01 | Dọn component/login legacy không dùng | P2 | S | Code hygiene |

---

## G. Risks và mitigation

| Risk | Mitigation |
|------|------------|
| Login challenge tăng ma sát | Trusted 30d; copy rõ; đo funnel trusted vs không |
| User hiểu nhầm verify = KYC | Copy tách biệt; legal review thị trường |
| Abuse resend | Cooldown + cap + IP limit (khi PO yêu cầu); monitor |
| FE/BE contract lệch | Error taxonomy chung; contract test; E2E staging |
| UI misleading (OAuth/referral) | AC-13–15; ưu tiên P0 honest UI |
| Link điều khoản giả | AC-16; PO/legal chốt URL hoặc tạm thời |

---

## H. Analytics events (tối thiểu)

| Event | Trigger | Properties gợi ý |
|-------|---------|------------------|
| `auth_signup_submitted` | Submit signup | `route`, `email_domain` (hash nếu cần), policy pass |
| `auth_signup_created` | Tạo account thành công | `verification_required=true` |
| `auth_verification_email_sent` | Gửi mail verify/challenge | `flow_type`, provider |
| `auth_verification_link_clicked` | Callback mở link | `flow_type`, outcome |
| `auth_login_challenge_required` | Cần challenge | `trusted_present` |
| `auth_login_trusted_device_bypass` | Bypass | optional age bucket |
| `auth_resend_clicked` / `auth_resend_blocked` | Resend | `reason`, cooldown/cap meta |
| `auth_login_success` | Vào app thành công | `method`, verified |

Không gửi password, token thô, secret lên analytics.

---

## I. Open questions

- Điều khoản & privacy: **URL chính thức** và ngôn ngữ pháp lý do ai duyệt trước go-live?
- Trusted revoke khi **chưa có logout UI**: chấp nhận revoke chỉ qua hết hạn TTL / thao tác support / API nội bộ cho đến P1?
- Provider down kéo dài: giữ **manual resend** hay cần fallback (post-MVP)?
- Có cần **cap resend theo IP** thêm (PO) hay đủ cap theo email cho MVP?

---

## J. Task-ready (gán team)

**BE:** signup + verify gate + login challenge + trusted + resend + error codes + audit (không log secret).

**FE:** signup/login/resend states; **FE-AUTH-HONEST**; layout signup; analytics.

**QA:** matrix P0; resend; honest UI regression; không lộ secret trong network/UI log.

---

## K. Definition of Done — gói Option A MVP (đồng bộ PO)

- Toàn bộ **AC-01–AC-12** và **AC-13–AC-16** pass trên staging.
- **Không** yêu cầu **AC-17 (logout UI)** trong go-live MVP trừ khi PO thay đổi scope.
- Không defect **P0** trên luồng auth; defect layout (dải đen) xử lý theo severity QA.
- Events chính trong mục **H** đã bắn đủ để đọc funnel cơ bản.

---

*Tài liệu thay thế phiên bản plan cũ trong cùng file; mọi thay đổi contract cần BA + PO xác nhận.*
