# TODO

## Current Status

- Initial CLI-backed `miku-text-bundle` Agent Skill is in late-stage hardening.
- Upstream main application anchor is `miku-text-bundle` release `v1.5.1`.
- Java companion runtime anchor is `miku-text-bundle-java` release `v1.5.0`.
- Received Node and Java runtime artifacts are present under `skills/igapyon-miku-text-bundle/runtime/`.
- Runtime artifact lookup verifies declared SHA-256 digests before execution.
- Java is the default runtime backend; Node is the fallback when Java is unavailable or unusable.
- Runtime CLI supports handoff and knowledge-source modes plus explicit input encoding options, including Shift_JIS.
- Node v1.5.1 and Java v1.5.0 both support knowledge-source execution.
- Generated skill discovery index is present at `skills/igapyon-miku-text-bundle/index.json`.
- Agent manifest no longer disables implicit invocation via `policy.allow_implicit_invocation`.
- Bundle contents verification and isolated bundle smoke tests are in place.
- GitHub Actions release asset workflow is present as `.github/workflows/release-build.yml`.
- Final local release build targets `bundle/igapyon-miku-text-bundle-skills-1.5.1.zip`.
- `npm test` currently validates the skill structure, runtime smoke paths, bundle contents, and isolated bundle execution.
- The upstream README and public CLI/runtime contract have been reviewed from the received Node source artifact and local runtime `--help` output.
- Similar local `-skills` sister projects under `workplace/refs-40` have been reviewed for compact CLI-backed shape.
- `references/INDEX.md`, `references/runtime/operations-map.md`, and docs contract tests now follow the sister project documentation pattern.

## Remaining Tasks

- Verify in a fresh Codex thread that `igapyon-miku-text-bundle` appears in
  the loaded skill list.
- GitHub push, GitHub Release creation, and release asset upload remain explicit
  follow-up actions unless requested.

## AI Agent Current Tasks

This section tracks active work items for AI agents.
Update this section while working. Do not rewrite unrelated TODO items.

### Tasks

- [x] Identify the target releases: Node `miku-text-bundle` is `v1.5.1`; Java `miku-text-bundle-java` is `v1.5.0`.
- [x] Update Node runtime artifact, Node source artifact, version anchors, digest declarations, documentation, tests, and generated indexes.
- [x] Update Java runtime artifact, Java source artifact, version anchors, digest declarations, documentation, tests, and generated indexes.
- [x] Run `npm test` and `npm run build`, then inspect the generated bundle zip.
- [ ] Reinstall or rebuild the local Codex skill from the generated bundle.
- [ ] Create the release tag `v1.5.1` after final version confirmation and local verification.
- [ ] Verify in a fresh Codex thread that `igapyon-miku-text-bundle` appears in the loaded skill list.
- [ ] Push tag, create GitHub Release, and upload release assets only when explicitly requested.

### Blockers

- Fresh Codex thread loaded-skill verification has not been run in this session.

### Retry Log

- None.
