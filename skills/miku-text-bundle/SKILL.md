---
name: miku-text-bundle
description: Use only when the user explicitly asks to use miku-text-bundle, miku-text-bundle-skills, or a documented miku-text-bundle Agent Skill workflow. Do not activate for generic text editing, summarization, file bundling, archive creation, or repository maintenance unless the user explicitly names this skill or upstream product.
---

# miku-text-bundle

This skill is the Agent Skills workflow adapter for the upstream `miku-text-bundle` main application.

Use it only after the user explicitly names `miku-text-bundle`, `miku-text-bundle-skills`, or asks to apply this skill. The upstream product owns product semantics, supported inputs, outputs, CLI/API behavior, diagnostics, and limitations.

## Current Status

This initial version has received CLI runtime artifacts. The skill remains a thin workflow adapter over the upstream runtime.

## Required First Checks

1. Read `references/upstream.md`.
2. Read `references/workflow.md`.
3. Confirm the requested input directory, output directory, and options.
4. Use the declared runtime artifacts under `runtime/` when execution is requested.
5. Prefer Java runtime first; use Node.js runtime when Java is missing or unusable.

## Operating Rules

- Preserve upstream semantics; do not reimplement core product behavior in skill prose or helper scripts.
- Keep generated or intermediate artifacts in user-selected paths or local scratch paths such as `workplace/`.
- Report unknown upstream contracts as blockers or follow-ups, not as inferred behavior.
- Treat files under `runtime/` as received upstream artifacts, not generated skill source.
- Do not use MCP as a backend or fallback in the initial version.
- Do not create GitHub repositories, pushes, tags, releases, or release assets from this workflow.

## References

- `references/upstream.md`: upstream anchor, compatibility source, and runtime artifact policy
- `references/workflow.md`: CLI-backed workflow and runtime selection policy
