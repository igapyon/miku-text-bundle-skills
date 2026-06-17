# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.1.1.2`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.1.1.2>
- Asset: `miku-text-bundle-1.1.1.2.mjs`
- Asset digest: `sha256:669cd8c9091054d0e491bcc0f5aed6dfd9299a74ec0f24735d39c48fdf489adb`
- Source asset: `miku-text-bundle-sources-1.1.1.2.tgz`
- Source asset digest: `sha256:1c7a81da02674e1fc15e970e45fb841818c2faf0b341549af8e964def896809b`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.1.1>
- Asset: `miku-text-bundle-java-1.1.1.jar`
- Asset digest: `sha256:c9ca0380c17e0fb77f5750bec582a8020177ff2169a5100bc03b6ce45eb5ee47`
- Source asset: `miku-text-bundle-java-sources-1.1.1.jar`
- Source asset digest: `sha256:48e16ea4c532bafd9b96f15f314f6ec9aca2ac3e2af241c8974e15c420889827`

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

The Node and Java runtime artifacts report CLI version `1.1.1` and accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both the Node and Java artifacts respond to `--version` with `1.1.1`.

## Upstream CLI Contract

The received Node source artifact for `v1.1.1.2` includes the upstream `README.md`,
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
- skip files that are binary, non-UTF-8, over the single-file byte limit, ignored by the input-root `.gitignore`, or under repository-root dot directories
- record skipped files, warnings, and extracted `TODO` / `FIXME` / `XXX` markers in the index file

The upstream `.gitignore` support is intentionally limited. It reads only the
input-root `.gitignore`, does not implement full Git ignore semantics, and does
not let include patterns restore `.gitignore`-excluded files or root dot
directory files.

The Java companion artifact is treated as the preferred execution runtime for
this skill, but the Node artifact remains the compatibility source for upstream
`miku-text-bundle` release `v1.1.1.2`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
