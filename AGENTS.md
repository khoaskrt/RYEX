# Agent Workflow Rules

**Before executing any task** in this repository (code, docs, or config), read:

1. [`docs/INDEX.md`](docs/INDEX.md) — bản đồ tài liệu và entry point.
2. [`docs/DOCUMENTATION_SCOPE.md`](docs/DOCUMENTATION_SCOPE.md) — phạm vi đặt file, quy ước tên/version, và **§5** (rà path trong doc sau khi đổi cấu trúc thư mục).

Then continue as below.

When a prompt mentions any role `<role>`, follow this order strictly before executing the task:

1. Check the `.codex` folder at the workspace root first.
2. Find and read the matching skill file: `skill_<role>.md`.
3. Execute the requested task only after reading that skill file.
4. If the skill file does not exist, explicitly report it and then use a safe fallback approach.

Scope: Apply this rule for every prompt in this repository.

Feature specs live under `docs/features/`; `src/features/*/README.md` points there—do not duplicate long spec files under `src/features`.
