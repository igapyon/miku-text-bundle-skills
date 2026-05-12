# miku-text-bundle-skills

Agent Skills package for `miku-text-bundle`.

This repository is the `-skills` companion repository for:

- Upstream main application: <https://github.com/igapyon/miku-text-bundle>
- Skill directory: `skills/miku-text-bundle/`
- Current maturity pattern: CLI-backed initial skeleton
- Backend policy: `cli-preferred`, with no MCP backend in the initial version
- Runtime selection: Java first, Node.js fallback when the Java runtime is missing or unusable

The upstream main application compatibility source is `miku-text-bundle` release `v0.8.0`. The Java companion runtime source is `miku-text-bundle-java` release `v0.8.0`. Keep product semantics in the upstream applications and use this repository as the agent-facing workflow adapter.

## Repository Layout

- `skills/miku-text-bundle/SKILL.md`: activation and primary operating instructions
- `skills/miku-text-bundle/references/`: detailed workflow and upstream notes
- `skills/miku-text-bundle/references/INDEX.md`: reference index for installed skill users
- `skills/miku-text-bundle/runtime/`: local destination for upstream runtime artifacts
- `skills/miku-text-bundle/lib/runtime-artifacts.mjs`: runtime artifact lookup and digest verification
- `docs/`: copied miku-soft design documents
- `scripts/`: repository validation scripts
- `workplace/`: local scratch area, ignored except for `.gitkeep`

## Operations

Run the focused validation command:

```sh
npm test
```

Runtime-only smoke testing is also available:

```sh
npm run test:runtime
```

Build the distributable skill bundle:

```sh
npm run build
```

GitHub Release asset workflow:

- `.github/workflows/release-build.yml` builds the release bundle zip and attaches it to `v*` GitHub Releases.
- The workflow verifies the declared Java and Node.js runtime artifacts before building.
- GitHub releases, tags, pushes, and uploaded assets remain human-operated release steps.

`workplace/` is for local scratch data, upstream source checkouts, generated artifacts, and verification files. Do not commit files from `workplace/` except `workplace/.gitkeep`.

GitHub repository creation, pushes, releases, tags, and release asset uploads are human responsibilities in this workflow.

This initial repository has no MCP backend. Do not call or configure MCP as an automatic fallback for `miku-text-bundle` operations.

## Runtime Artifacts

The following received artifacts are expected under `skills/miku-text-bundle/runtime/`:

- `miku-text-bundle-0.8.0.mjs`
- `miku-text-bundle-sources-0.8.0.tgz`
- `miku-text-bundle-java-0.8.0.jar`
- `miku-text-bundle-java-sources-0.8.0.jar`

The `0.8.0` runtimes support explicit input encoding options, including
`--encoding shift_jis` and extension-specific rules such as
`--encoding-extension ".java=shift_jis"`.

## Developer Documents

- [TODO.md](TODO.md)
- [skills/miku-text-bundle/references/INDEX.md](skills/miku-text-bundle/references/INDEX.md)
- [docs/miku-soft-40-agentskills-design-v20260506.md](docs/miku-soft-40-agentskills-design-v20260506.md)
