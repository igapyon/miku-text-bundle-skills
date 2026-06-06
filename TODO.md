# TODO

## Current Status

- Initial CLI-backed `miku-text-bundle` Agent Skill is in late-stage hardening.
- Upstream main application anchor is `miku-text-bundle` release `v0.9.0`.
- Java companion runtime anchor is `miku-text-bundle-java` release `v0.9.0`.
- Received Node and Java runtime artifacts are present under `skills/miku-text-bundle/runtime/`.
- Runtime artifact lookup verifies declared SHA-256 digests before execution.
- Java is the default runtime backend; Node is the fallback when Java is unavailable or unusable.
- Runtime CLI supports explicit input encoding options, including Shift_JIS.
- Bundle contents verification and isolated bundle smoke tests are in place.
- GitHub Actions release asset workflow is present as `.github/workflows/release-build.yml`.
- Final local release build currently generates `bundle/igapyon-miku-text-bundle-skills-0.9.0.zip`.
- `npm test` currently validates the skill structure, runtime smoke paths, bundle contents, and isolated bundle execution.
- The upstream README and public CLI/runtime contract have been reviewed from the received Node source artifact and local runtime `--help` output.
- Similar local `-skills` sister projects under `workplace/refs-40` have been reviewed for compact CLI-backed shape.
- `references/INDEX.md`, `references/runtime/operations-map.md`, and docs contract tests now follow the sister project documentation pattern.

## Remaining Tasks

- Human release work remains outside this skill workflow: create/push tags, create GitHub Releases, and upload release assets if needed.
