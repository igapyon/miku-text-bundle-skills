# miku-text-bundle-skills

Agent Skills package for `miku-text-bundle`.

This repository is the `-skills` companion repository for:

- Upstream main application: <https://github.com/igapyon/miku-text-bundle>
- Agent Skill name: `igapyon-miku-text-bundle`
- Skill directory: `skills/igapyon-miku-text-bundle/`
- Current maturity pattern: CLI-backed initial skeleton
- Backend policy: `cli-preferred`, with no MCP backend in the initial version
- Runtime selection: Java first, Node.js fallback when the Java runtime is missing or unusable

The upstream main application compatibility source is `miku-text-bundle` release `v1.0.1`. The Java companion runtime source is `miku-text-bundle-java` release `v1.0.1`. Keep product semantics in the upstream applications and use this repository as the agent-facing workflow adapter.

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
`igapyon-miku-text-bundle-skills-1.0.1.zip`. Inside the extracted bundle, install
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

When handing a generated bundle to a generative AI Web UI, it is recommended to
paste `<prefix>-000-prompt.md` as the first message body instead of uploading it
as an attachment. This is a recommended stability practice, not a strict
requirement; depending on the target UI and workflow, the prompt file may still
be uploaded as an attachment. The part files (`<prefix>-001.md` and later) and
the final index file (`<prefix>-999-index.md`) may be uploaded as attachments
when the target UI supports file upload.

## Runtime Artifacts

The following received artifacts are expected under `skills/igapyon-miku-text-bundle/runtime/`:

- `miku-text-bundle-1.0.1.mjs`
- `miku-text-bundle-sources-1.0.1.tgz`
- `miku-text-bundle-java-1.0.1.jar`
- `miku-text-bundle-java-sources-1.0.1.jar`

The Node `1.0.1` runtime and Java `1.0.1` runtime support explicit input encoding options, including
`--encoding shift_jis` and extension-specific rules such as
`--encoding-extension ".java=shift_jis"`.

## Developer Documents

- [TODO.md](TODO.md)
- [skills/igapyon-miku-text-bundle/index.json](skills/igapyon-miku-text-bundle/index.json)
- [skills/igapyon-miku-text-bundle/references/INDEX.md](skills/igapyon-miku-text-bundle/references/INDEX.md)
- [docs/miku-soft-reference.md](docs/miku-soft-reference.md)
