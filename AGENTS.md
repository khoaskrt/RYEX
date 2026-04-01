# Agent Workflow Rules

When a prompt mentions any role `<role>`, follow this order strictly before executing the task:

1. Check the `.codex` folder at the workspace root first.
2. Find and read the matching skill file: `skill_<role>.md`.
3. Execute the requested task only after reading that skill file.
4. If the skill file does not exist, explicitly report it and then use a safe fallback approach.

Scope: Apply this rule for every prompt in this repository.
