# BRD - Logic Dang Ky/Login

## 1) Problem Framing

- **Business goal:** Chuan hoa luong dieu huong `Landing -> Login/Sign up/Market -> Auth`, giam nham lan UI, tang conversion onboarding.
- **User pain:** Navigation/auth behavior chua nhat quan giua cac trang; CTA co luc click duoc khi chua du du lieu; tuy chon so dien thoai gay ky vong sai khi chua ho tro.
- **Success metric:**
  - CTR tu landing nav "Dang nhap" sang `/app/auth/login` tang so voi baseline.
  - Ty le user di tu hero email -> signup tang.
  - 100% pass acceptance criteria ben duoi.
  - Khong con bug blocker/critical ve auth navigation trong sprint nay.

## 2) Requirement Clarification

- **Assumptions:**
  - Routes:
    - Home: `/`
    - Login: `/app/auth/login`
    - Signup: `/app/auth/signup`
    - Market: `/app/market`
  - Login/Signup dung auth UI chung, co logo `RYEX`.
  - Landing hero co email input + CTA signup.
- **Open questions:**
  - Prefill email dung query param (`?email=`) hay state tam thoi?
  - Tooltip "Coming soon" theo native title hay custom tooltip?
  - Co can tracking event cho click bi chan tren "So dien thoai" khong?
- **Constraints:**
  - Khong mo rong scope backend auth trong task nay.
  - Chua mo login/signup bang so dien thoai trong MVP sprint.
  - Khong gay regression cho route da on dinh (`/`, `/app/market`, `/app/auth/*`).

## 3) User Stories

- **US-01:** As a user, I want trang login co navigation giong signup (chi logo), so that onboarding giam phan tam.
- **US-02:** As a user, I want click logo `RYEX` tren login/signup de quay ve home, so that toi quay lai landing nhanh.
- **US-03:** As a user, I want tab "So dien thoai" chua su dung va khong click duoc, so that toi khong bi nham la da ho tro.
- **US-04:** As a landing user, I want nut "Dang nhap" tren nav di den login page, so that toi vao auth dung diem.
- **US-05:** As a landing user, I want CTA signup o hero chi click duoc khi email hop le, so that luong dang ky chat luong hon.
- **US-06:** As a landing user, I want email da nhap o hero duoc prefill o signup, so that toi khong phai nhap lai.
- **US-07:** As a market user, I want nut "Dang nhap" va "Dang ky" dan dung route auth, so that toi thao tac nhanh va dung y dinh.

## 4) Acceptance Criteria (Given/When/Then)

### AC-01 Login navigation dong bo voi signup
- Given user o `/app/auth/login`
- When page render
- Then header chi hien logo `RYEX`, khong hien nav menu kieu landing.

### AC-02 Logo RYEX quay ve home
- Given user o `/app/auth/login` hoac `/app/auth/signup`
- When click logo `RYEX`
- Then dieu huong ve `/`.

### AC-03 Tam khoa so dien thoai
- Given user hover vao tab "So dien thoai" (desktop)
- When hover
- Then hien "Coming soon".
- Given user click tab "So dien thoai"
- When click
- Then khong doi state form, khong submit, khong dieu huong.
- Given user tren mobile (khong hover)
- When xem tab "So dien thoai"
- Then thay disabled state ro rang, khong tuong tac duoc.

### AC-04 Landing nav Dang nhap
- Given user o `/`
- When click "Dang nhap" tren navigation bar
- Then dieu huong den `/app/auth/login`.

### AC-05 Landing hero email gating
- Given user chua nhap email hop le
- When xem CTA signup trong hero
- Then button disabled, khong click duoc.
- Given user nhap email hop le
- When click CTA signup
- Then dieu huong den `/app/auth/signup`.

### AC-06 Signup prefill email
- Given user da nhap email hop le o landing hero
- When dieu huong sang `/app/auth/signup`
- Then truong email tren signup duoc prefill bang email vua nhap.

### AC-07 Market auth button routing
- Given user o `/app/market`
- When click "Dang nhap"
- Then dieu huong den `/app/auth/login`.
- Given user o `/app/market`
- When click "Dang ky"
- Then dieu huong den `/app/auth/signup`.

## 5) Prioritized Backlog

### P0 (bat buoc cho sprint nay)
- Login page: dong bo nav nhu signup (logo-only).
- Logo `RYEX` click ve home o login/signup.
- Disable "So dien thoai" + thong diep "Coming soon".
- Landing nav "Dang nhap" route dung.
- Landing hero: email validation -> enable CTA signup.
- Signup prefill email tu landing hero.
- Market: button dang nhap/dang ky route dung.

### P1
- Tracking event chi tiet cho disabled click va validation fail.
- Tinh chinh tooltip/UX vi tri mobile-desktop.

### P2
- A/B test copy CTA va message "Coming soon".

## 6) Risks and Mitigations

- **Product risk:** User khong hieu vi sao tab so dien thoai khong click duoc.  
  **Mitigation:** Disabled state ro + "Coming soon" nhin thay duoc.
- **Tech risk:** Regression route auth/market sau khi sua layout/nav.  
  **Mitigation:** QA run full checklist theo route (duoi).
- **Data risk:** Prefill email qua query co the lo du lieu neu log khong dung.  
  **Mitigation:** sanitize input, tranh log plain email o noi nhay cam.

## 7) Analytics Events (MVP minimum)

- `landing_login_click`  
  - trigger: click nav "Dang nhap" o landing  
  - properties: `source_page`, `target_route`
- `landing_hero_email_valid`  
  - trigger: email hero hop le  
  - properties: `email_domain`, `is_valid`
- `landing_hero_signup_click`  
  - trigger: click CTA signup o hero  
  - properties: `source_page`, `prefill_email_present`
- `auth_phone_click_blocked`  
  - trigger: click tab phone bi chan  
  - properties: `page`, `blocked_reason`
- `market_login_click` / `market_signup_click`  
  - trigger: click auth CTA tren market  
  - properties: `source_page`, `target_route`

---

# Handoff-Ready for FE + QA (Sprint Execution)

## A) FE Implementation Checklist (by route)

### Route: `/app/auth/login`
- [ ] Header chi con logo `RYEX`, khong co navigation menu.
- [ ] Logo `RYEX` click ve `/`.
- [ ] Tab "So dien thoai" disabled, khong click duoc.
- [ ] Hover desktop hien "Coming soon".
- [ ] Mobile van the hien disabled state ro rang.

### Route: `/app/auth/signup`
- [ ] Header chi con logo `RYEX`, khong co navigation menu.
- [ ] Logo `RYEX` click ve `/`.
- [ ] Tab "So dien thoai" disabled, khong click duoc.
- [ ] Hover desktop hien "Coming soon".
- [ ] Email input doc gia tri prefill tu landing hero.

### Route: `/`
- [ ] Nav button "Dang nhap" dieu huong `/app/auth/login`.
- [ ] Hero CTA signup disabled neu email chua hop le.
- [ ] Hero CTA signup enable khi email hop le.
- [ ] Click CTA -> dieu huong `/app/auth/signup` + gui gia tri email de prefill.

### Route: `/app/market`
- [ ] Button "Dang nhap" dieu huong `/app/auth/login`.
- [ ] Button "Dang ky" dieu huong `/app/auth/signup`.

## B) QA Test Cases + Expected Results (by route)

### Route: `/app/auth/login`

**TC-LGN-01: Login header logo-only**
- Steps:
  1. Mo `/app/auth/login`.
  2. Quan sat header.
- Expected:
  - Chi co logo `RYEX`.
  - Khong co nav item kieu landing.

**TC-LGN-02: Logo back to home**
- Steps:
  1. Tai `/app/auth/login`, click logo `RYEX`.
- Expected:
  - Dieu huong den `/`.

**TC-LGN-03: Phone option disabled**
- Steps:
  1. Tai `/app/auth/login`, hover tab "So dien thoai" (desktop).
  2. Click tab "So dien thoai".
- Expected:
  - Hover hien "Coming soon".
  - Click khong doi form mode, khong redirect, khong submit.

### Route: `/app/auth/signup`

**TC-SUP-01: Signup header logo-only**
- Steps:
  1. Mo `/app/auth/signup`.
- Expected:
  - Chi co logo `RYEX`.
  - Khong co nav item kieu landing.

**TC-SUP-02: Logo back to home**
- Steps:
  1. Click logo `RYEX`.
- Expected:
  - Dieu huong den `/`.

**TC-SUP-03: Phone option disabled**
- Steps:
  1. Hover tab "So dien thoai".
  2. Click tab.
- Expected:
  - Hover hien "Coming soon".
  - Click bi chan, khong doi state form.

**TC-SUP-04: Email prefill tu landing**
- Preconditions:
  - Co email hop le da nhap o landing hero.
- Steps:
  1. Tu landing, click CTA signup.
  2. Den `/app/auth/signup`.
- Expected:
  - Truong email tren signup da duoc dien san dung gia tri vua nhap.

### Route: `/`

**TC-LND-01: Nav login routing**
- Steps:
  1. Mo `/`.
  2. Click "Dang nhap" tren nav.
- Expected:
  - Dieu huong den `/app/auth/login`.

**TC-LND-02: Hero CTA disabled khi email invalid/empty**
- Steps:
  1. De trong email hoac nhap email sai.
  2. Thu click CTA signup.
- Expected:
  - CTA disabled, khong dieu huong.
  - Hien validation message (neu co quy dinh hien thi).

**TC-LND-03: Hero CTA enabled khi email valid**
- Steps:
  1. Nhap email hop le.
  2. Click CTA signup.
- Expected:
  - Dieu huong `/app/auth/signup`.
  - Email duoc truyen sang prefill.

### Route: `/app/market`

**TC-MKT-01: Market login button routing**
- Steps:
  1. Mo `/app/market`.
  2. Click "Dang nhap".
- Expected:
  - Dieu huong den `/app/auth/login`.

**TC-MKT-02: Market signup button routing**
- Steps:
  1. Tai `/app/market`, click "Dang ky".
- Expected:
  - Dieu huong den `/app/auth/signup`.

## C) Regression Checklist (must-run before close sprint)

- [ ] `/` van load binh thuong, nav khong vo layout.
- [ ] `/app/auth/login` va `/app/auth/signup` khong co regression responsive desktop/mobile.
- [ ] Khong xuat hien vong lap route hoac redirect sai.
- [ ] Flow from landing hero -> signup prefill hoat dong on dinh sau reload.
- [ ] Market auth buttons dieu huong dung tren desktop + mobile.

## D) Done Criteria for this sprint scope

- FE checklists tat ca done.
- QA test cases P0 pass 100%.
- Khong con bug severity S1/S2 cho nhom auth navigation va signup/login flow.
- PM co the go/no-go dua tren report QA + regression checklist.
