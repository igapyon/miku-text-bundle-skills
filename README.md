# miku-text-bundle-skills

Agent Skills package for `miku-text-bundle`.

This repository is the `-skills` companion repository for:

- Upstream main application: <https://github.com/igapyon/miku-text-bundle>
- Skill directory: `skills/miku-text-bundle/`
- Current maturity pattern: CLI-backed initial skeleton
- Backend policy: `cli-preferred`, with no MCP backend in the initial version
- Runtime selection: Java first, Node.js fallback when the Java runtime is missing or unusable

The upstream main application compatibility source is `miku-text-bundle` release `v0.5.0.3`. The Java companion runtime source is `miku-text-bundle-java` release `v0.5.0.2`. Keep product semantics in the upstream applications and use this repository as the agent-facing workflow adapter.

## Repository Layout

- `skills/miku-text-bundle/SKILL.md`: activation and primary operating instructions
- `skills/miku-text-bundle/references/`: detailed workflow and upstream notes
- `skills/miku-text-bundle/runtime/`: local destination for upstream runtime artifacts when CLI-backed execution is added
- `lib/runtime-artifacts.mjs`: runtime artifact lookup and digest verification
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

`workplace/` is for local scratch data, upstream source checkouts, generated artifacts, and verification files. Do not commit files from `workplace/` except `workplace/.gitkeep`.

GitHub repository creation, pushes, releases, tags, and release asset uploads are human responsibilities in this workflow.

This initial repository has no MCP backend. Do not call or configure MCP as an automatic fallback for `miku-text-bundle` operations.

## Runtime Artifacts

The following received artifacts are expected under `skills/miku-text-bundle/runtime/`:

- `miku-text-bundle-0.5.0.3.mjs`
- `miku-text-bundle-sources-0.5.0.3.tgz`
- `miku-text-bundle-java-0.5.0.2.jar`
- `miku-text-bundle-java-sources-0.5.0.2.jar`
