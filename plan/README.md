# RYEX Plan Workspace

Tài liệu này quy định cách mọi agent làm việc dựa trên plan tuần 1.

## Nguồn plan chính
- Plan chuẩn: [`Week 1.md`](./Week%201.md)
- Mọi task triển khai phải bám theo file này.
- Nếu có thay đổi phạm vi, cập nhật trực tiếp vào `Week 1.md` và ghi rõ lý do trong phần Change Log phía dưới.

## Quy ước thực thi cho agent
- Không tự mở rộng scope ngoài plan khi chưa có yêu cầu mới từ owner.
- Mỗi task phải map được với một mục trong `Week 1.md`.
- Khi bắt đầu làm task, cập nhật trạng thái vào bảng Tracking.
- Khi hoàn tất task, bắt buộc ghi bằng chứng (PR/commit/file/test result).

## Tracking board (cập nhật hằng ngày)

| Day | Workstream | Owner Agent | Status | Output | Evidence | Blocker |
|---|---|---|---|---|---|---|
| 1 | Architecture + Foundation | unassigned | todo | ADR + DB schema + route map | n/a | n/a |
| 2 | Auth Backend Core | unassigned | todo | auth services + APIs | n/a | n/a |
| 3 | OTP Email + Rate Limit | unassigned | todo | OTP flow + audit log | n/a | n/a |
| 4 | Auth UI Wiring | unassigned | todo | signup/login wired to API | n/a | n/a |
| 5 | Profile + Guard + Nav | unassigned | todo | profile page + middleware | n/a | n/a |
| 6 | Market/Profile Polish + Seed | unassigned | todo | seed + data integration | n/a | n/a |
| 7 | Hardening + Release | unassigned | todo | test pass + staging doc | n/a | n/a |

Status chuẩn: `todo | in_progress | blocked | done`

## Checklist nghiệm thu (Definition of Done)
- Có đủ 4 màn hình chạy được: landing, market, signup/login, profile.
- Signup/Login chạy thật, có OTP email cho signup.
- Điều hướng CTA rõ ràng, guard đúng cho logged-in/logged-out.
- Có DB lưu được users/sessions/otp/audit logs.
- Có tài liệu system design + sơ đồ + quyết định kỹ thuật.
- Có staging URL để demo nội bộ.

## Mẫu cập nhật nhanh cho từng task
Sử dụng template này khi agent báo cáo:

```md
### [Day X] <Task name>
- Owner: <agent>
- Status: <todo/in_progress/blocked/done>
- Scope: <map tới mục nào trong Week 1.md>
- Changes:
  - <item 1>
  - <item 2>
- Evidence:
  - <commit/PR/file/test output>
- Risks/Blockers:
  - <nếu có>
- Next step:
  - <step tiếp theo>
```

## Change Log
- 2026-03-26: Khởi tạo `plan/README.md` để đồng bộ workflow multi-agent theo `Week 1.md`.
