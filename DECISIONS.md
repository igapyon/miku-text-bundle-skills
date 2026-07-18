---
purpose: ai-agent-decisions
read_when:
  - before_starting_work
  - when_making_decision
  - when_looping_or_repeating_work
update_when:
  - important_decision_is_made
  - option_is_rejected
  - work_is_deferred
---

# Decisions

This file records important decisions for the AI agent.
Read this before making or revisiting decisions, especially when the work seems to loop.

## 2026-06-23: Keep `TODO.md` as the project task file

Reason:
`TODO.md` already tracks the repository's hardening status and release-side remaining work.

Impact:
AI-agent-specific active work is tracked only in the `## AI Agent Current Tasks` section of `TODO.md`; the rest of the file keeps its existing project purpose.

## 2026-06-23: Keep product behavior outside this skill package

Reason:
This repository is the agent-facing `-skills` companion for `miku-text-bundle`; runtime semantics belong in the upstream Node and Java artifacts.

Impact:
Changes here should focus on skill activation, handoff workflow, runtime artifact lookup, validation, documentation, and bundle packaging.

## 2026-06-23: Include release tag creation in the next update goal

Reason:
The next user-directed goal is to incorporate both Node and Java runtime updates and continue through release tag creation.

Impact:
Local update work should include version-anchor alignment, artifact and digest updates, validation, bundle rebuild, final version confirmation, and tag creation. GitHub push, GitHub Release creation, and asset upload remain explicit follow-up actions unless requested.

## 2026-06-23: Use `v1.3.0` for both Node and Java runtime anchors

Reason:
GitHub latest release metadata reports `miku-text-bundle` `v1.3.0` and `miku-text-bundle-java` `v1.3.0`.

Impact:
The skill package version, runtime artifact names, SHA-256 digest declarations, documentation, tests, generated index, bundle zip, and release tag target are aligned on `1.3.0`.

## 2026-07-18: Update both runtime anchors to `v1.6.0`

Reason:
GitHub release metadata reports `miku-text-bundle` `v1.6.0` and `miku-text-bundle-java` `v1.6.0`, and both received runtime artifacts expose matching CLI help and version output.

Impact:
The skill package version, runtime artifact names, SHA-256 digest declarations, documentation, tests, generated index, and bundle zip target are aligned on `1.6.0`. Release tag creation remains a separate human-confirmed step.
