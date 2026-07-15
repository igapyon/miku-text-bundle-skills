# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.4.0`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.4.0>
- Asset: `miku-text-bundle-1.4.0.mjs`
- Asset digest: `sha256:e5f5f3bef6c6b974e0a5d14f2e939437529e09fb787218938ccdb132824e0c18`
- Source asset: `miku-text-bundle-sources-1.4.0.tgz`
- Source asset digest: `sha256:f043f39ca172f581f7f202f4896d182d3ace1ee3227beae85adcf19e2c20ef59`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.4.0>
- Asset: `miku-text-bundle-java-1.4.0.jar`
- Asset digest: `sha256:601a357f35817286120aaf192e6355eb6372b19410c2d85743aad69219034e19`
- Source asset: `miku-text-bundle-java-sources-1.4.0.jar`
- Source asset digest: `sha256:2b900557970bb5d234a995efea9ac5e6ccca646c2740ce9a869cb4d9c1dc2628`

## Runtime Artifact Policy

Runtime artifacts are expected under:

```text
skills/igapyon-miku-text-bundle/runtime/
```

Do not search broadly through the workspace for product runtimes before checking this declared runtime directory.

## Runtime Smoke Notes

Both runtime artifacts accept the same basic CLI shape:

```text
miku-text-bundle --input <dir> --output <dir> [--max-chars 120000] [--max-input-file-bytes 1000000] [--verbose]
```

The Node and Java runtime artifacts report CLI version `1.4.0` and accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both the Node and Java artifacts respond to `--version` with `1.4.0`.

## Upstream CLI Contract

The received Node source artifact for `v1.4.0` includes the upstream `README.md`,
`TODO.md`, TypeScript source, tests, and design notes. The README and runtime
`--help` output describe this core behavior:

- collect text files under an input directory and emit split Markdown bundles for generative AI handoff
- require the output directory to be specified with `--output`
- generate `text-bundle-001.md` through `text-bundle-999.md` part files as needed
- embed prompt instructions in the first generated part file
- embed the terminal index in the final generated part file
- default `--max-chars` to `120000`
- default `--max-input-file-bytes` to `1000000`
- accept `--encoding utf-8|shift_jis` for the default input text encoding
- accept `--encoding-extension ".ext=shift_jis"` for extension-specific input encoding
- accept `--add-exclude-extension`, `--remove-exclude-extension`, `--add-exclude-directory`, and `--remove-exclude-directory` options for exclusion policy adjustments
- accept `--dry-run` to estimate collection and parts without writing files
- skip files that are binary, non-UTF-8, over the single-file byte limit, ignored by the input-root `.gitignore`, or under repository-root dot directories
- record skipped files, warnings, and extracted `TODO` / `FIXME` / `XXX` markers in the index file

The upstream `.gitignore` support is intentionally limited. It reads only the
input-root `.gitignore`, does not implement full Git ignore semantics, and does
not let include patterns restore `.gitignore`-excluded files or root dot
directory files.

The Java companion artifact is treated as the preferred execution runtime for
this skill, but the Node artifact remains the compatibility source for upstream
`miku-text-bundle` release `v1.4.0`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
