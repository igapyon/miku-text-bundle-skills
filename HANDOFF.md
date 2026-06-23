---
purpose: ai-agent-handoff
read_when:
  - before_resuming_work
  - before_handing_off_work
  - when_context_is_missing
update_when:
  - work_is_paused
  - handoff_summary_changes
  - verification_status_changes
---

# Handoff

This file summarizes the current working state for the next human or AI agent.
Keep it concise. Do not use this as a full work log or a replacement for `TODO.md` and `DECISIONS.md`.

## Current State

- The repository is a CLI-backed Agent Skill package for `miku-text-bundle`.
- The installed-skill visibility fix was committed as `30dc47d fix: make miku-text-bundle skill visible`.
- `agents/openai.yaml` no longer sets `policy.allow_implicit_invocation: false`.
- Agent state management files have been initialized in this repository.
- Node and Java runtime artifacts have been updated to upstream `v1.3.0`.
- `npm test` and `npm run build` pass with the `v1.3.0` runtime set.
- The local installed Codex skill was replaced from the generated `v1.3.0` bundle.
- Local lightweight tag `v1.3.0` has been created.

## Next Action

- Verify in a fresh Codex thread that `igapyon-miku-text-bundle` appears in the loaded skill list, then push the branch/tag and create the GitHub Release only when requested.

## Relevant Files

- `GOAL.md`: current objective, done conditions, and stop conditions.
- `TODO.md`: project status, remaining tasks, and AI-agent current tasks.
- `DECISIONS.md`: repository maintenance decisions.
- `skills/igapyon-miku-text-bundle/SKILL.md`: installed skill activation and workflow instructions.
- `skills/igapyon-miku-text-bundle/agents/openai.yaml`: OpenAI agent manifest.
- `skills/igapyon-miku-text-bundle/index.json`: generated skill discovery index.
- `skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs`: runtime artifact names and SHA-256 digests.
- `skills/igapyon-miku-text-bundle/runtime/`: bundled Node and Java runtime artifacts.
- `package.json`: package version and validation/build scripts.

## Watch Outs

- Do not move product behavior into this skill repository; keep it in upstream runtime artifacts.
- Create the release tag only after final version confirmation and local verification.
- Treat GitHub push, GitHub Release creation, and asset upload as explicit follow-up actions unless requested.

## Last Verification

- `npm run build` passed on 2026-06-23 before state files were initialized.
- `npm test` passed on 2026-06-23 after state files were initialized.
- `npm test` passed on 2026-06-23 after updating Node and Java runtimes to `v1.3.0`.
- `npm run build` passed on 2026-06-23 and generated `bundle/igapyon-miku-text-bundle-skills-1.3.0.zip`.
