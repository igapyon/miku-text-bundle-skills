# miku-text-bundle-skills

Agent Skills package for `miku-text-bundle`.

This repository is the `-skills` companion repository for:

- Upstream main application: <https://github.com/igapyon/miku-text-bundle>
- Agent Skill name: `igapyon-miku-text-bundle`
- Skill directory: `skills/igapyon-miku-text-bundle/`
- Current maturity pattern: CLI-backed initial skeleton
- Backend policy: `cli-preferred`, with no MCP backend in the initial version
- Runtime selection: Java first, Node.js fallback when the Java runtime is missing or unusable

The upstream main application compatibility source is `miku-text-bundle` release `v1.6.0`. The Java companion runtime source is `miku-text-bundle-java` release `v1.6.0`. Keep product semantics in the upstream applications and use this repository as the agent-facing workflow adapter.

## Repository Layout

- `skills/igapyon-miku-text-bundle/SKILL.md`: activation and primary operating instructions
- `skills/igapyon-miku-text-bundle/index.json`: generated discovery index for the installed skill
- `skills/igapyon-miku-text-bundle/references/`: detailed workflow and upstream notes
- `skills/igapyon-miku-text-bundle/references/INDEX.md`: reference index for installed skill users
- `skills/igapyon-miku-text-bundle/runtime/`: local destination for upstream runtime artifacts
- `skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs`: runtime artifact lookup and digest verification
- `docs/miku-soft-reference.md`: project-local entry point to the shared miku-soft guidance
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

The generated release zip keeps the repository package name, such as
`igapyon-miku-text-bundle-skills-1.6.0.zip`. Inside the extracted bundle, install
the `skills/igapyon-miku-text-bundle/` directory into the target Agent Skills
home.

GitHub Release asset workflow:

- `.github/workflows/release-build.yml` builds the release bundle zip and attaches it to `v*` GitHub Releases.
- The workflow verifies the declared Java and Node.js runtime artifacts before building.
- GitHub releases, tags, pushes, and uploaded assets remain human-operated release steps.

`workplace/` is for local scratch data, upstream source checkouts, generated artifacts, and verification files. Do not commit files from `workplace/` except `workplace/.gitkeep`.

GitHub repository creation, pushes, releases, tags, and release asset uploads are human responsibilities in this workflow.

This initial repository has no MCP backend. Do not call or configure MCP as an automatic fallback for `miku-text-bundle` operations.

## Generated Bundle Handoff

When handing a generated bundle to a generative AI Web UI, send the part files
in filename order, starting with `<prefix>-001.md`. The first part embeds the
prompt instructions, and the final part embeds the index. For a one-part bundle,
`<prefix>-001.md` is both the prompt-bearing and terminal index-bearing file.

For neutral knowledge-source preparation, use `--mode knowledge-source`. This
produces content parts plus a separate `<prefix>-index.md` management index;
the content parts do not embed handoff prompts or a terminal index. Both the
Node v1.6.0 and Java v1.6.0 runtimes support this mode.

## Runtime Artifacts

The following received artifacts are expected under `skills/igapyon-miku-text-bundle/runtime/`:

- `miku-text-bundle-1.6.0.mjs`
- `miku-text-bundle-sources-1.6.0.tgz`
- `miku-text-bundle-java-1.6.0.jar`
- `miku-text-bundle-java-sources-1.6.0.jar`

The Node and Java runtimes both report CLI version `1.6.0`.
Both support handoff and
knowledge-source modes, and support explicit input encoding options, including
`--encoding shift_jis` and extension-specific rules such as
`--encoding-extension ".java=shift_jis"`.

## Developer Documents

- [TODO.md](TODO.md)
- [skills/igapyon-miku-text-bundle/index.json](skills/igapyon-miku-text-bundle/index.json)
- [skills/igapyon-miku-text-bundle/references/INDEX.md](skills/igapyon-miku-text-bundle/references/INDEX.md)
- [docs/miku-soft-reference.md](docs/miku-soft-reference.md)
