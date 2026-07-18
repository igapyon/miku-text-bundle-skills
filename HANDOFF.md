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
- Node and Java runtime artifacts have been updated to upstream `v1.6.0`.
- Artifact names, SHA-256 declarations, documentation, tests, release workflow, and generated skill index are aligned on `v1.6.0`.
- `npm test` and `npm run build` pass with the `v1.6.0` runtime set.
- The generated release bundle is `bundle/igapyon-miku-text-bundle-skills-1.6.0.zip`.
- The local Codex skill has not yet been reinstalled from the `v1.6.0` bundle, and the `v1.6.0` repository tag has not been created.

## Next Action

- Reinstall the local Codex skill from the generated `v1.6.0` bundle, verify it in a fresh thread, and create or push the tag and GitHub Release only when explicitly requested.

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

- `npm test` passed on 2026-07-18 with 9 tests after updating Node and Java runtimes to `v1.6.0`.
- `npm run build` passed on 2026-07-18 and generated `bundle/igapyon-miku-text-bundle-skills-1.6.0.zip`.
- Node and Java `v1.6.0` runtimes report version `1.6.0` and expose identical `--help` output.
