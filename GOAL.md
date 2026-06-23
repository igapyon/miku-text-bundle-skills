---
purpose: ai-agent-goal
read_when:
  - before_starting_work
  - before_finishing_work
  - when_scope_is_unclear
update_when:
  - goal_changes
  - done_conditions_change
  - stop_conditions_change
---

# Goal

This file defines what the AI agent is trying to accomplish.
Read this before starting work, before deciding that work is complete, and whenever scope becomes unclear.

## Objective

Update this `igapyon-miku-text-bundle` Agent Skill package to the latest intended Node and Java runtime releases, verify the package, rebuild the distributable bundle, and finish by creating the release tag when explicitly ready.

## Done

- The repository validates with `npm test` after changes that affect skill structure, runtime wiring, documentation, or bundle contents.
- The distributable bundle is rebuilt with `npm run build` when source skill files or release contents change.
- Node runtime artifacts, Java runtime artifacts, version anchors, digest declarations, documentation, tests, and generated indexes are consistent.
- A release tag is created after the user confirms the final release version and local verification passes.
- Agent state files stay lightweight and reflect the current repository work state.

## Stop

- Scope expands beyond this skill repository into upstream product behavior without explicit user direction.
- The target Node or Java release version is unclear.
- Tag creation is requested before the final release version is confirmed.
- A requested change requires overwriting existing human-authored state without review.
- The same underlying failure is recorded 3 times in the `TODO.md` `Retry Log`.
