# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.6.0`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.6.0>
- Asset: `miku-text-bundle-1.6.0.mjs`
- Asset digest: `sha256:b1044ae7fbcc13b5998d8aa857445bf80de02392875c75ecd002186e1f353c8b`
- Source asset: `miku-text-bundle-sources-1.6.0.tgz`
- Source asset digest: `sha256:2b6d2d6c0b4c27afb4285b29b0782428ddb3d488ab355c9e2320cbc021c011e3`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.6.0>
- Asset: `miku-text-bundle-java-1.6.0.jar`
- Asset digest: `sha256:b05d78b142af4cb8f99989a7428c6516e4aec2abea4ade51e772eb4cb853df97`
- Source asset: `miku-text-bundle-java-sources-1.6.0.jar`
- Source asset digest: `sha256:26519a47b84a48bedd50fa2c052a317f39553579492115fcaabc2a62ffc5704b`

## Runtime Artifact Policy

Runtime artifacts are expected under:

```text
skills/igapyon-miku-text-bundle/runtime/
```

Do not search broadly through the workspace for product runtimes before checking this declared runtime directory.

## Runtime Smoke Notes

Both runtime artifacts accept the same basic CLI shape:

```text
miku-text-bundle --input <dir> --output <dir> [--mode handoff|knowledge-source] [--max-chars 120000] [--max-input-file-bytes 1000000] [--verbose]
```

The Node and Java runtimes both report CLI version `1.6.0`.
Both accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both runtime artifacts successfully execute `--mode knowledge-source` and
expose identical `--help` output.

## Upstream CLI Contract

The received Node source artifact for `v1.6.0` includes the upstream `README.md`,
`TODO.md`, TypeScript source, tests, and design notes. The README and runtime
`--help` output describe this core behavior:

- collect text files under an input directory and emit split Markdown bundles for generative AI handoff or neutral knowledge-source preparation
- support `--mode handoff|knowledge-source`, defaulting to `handoff`
- generate a separate `<prefix>-index.md` management index in knowledge-source mode without embedding handoff prompt or terminal-index sections in content parts
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
`miku-text-bundle` release `v1.6.0`.

## Remaining Follow-Ups

- Continue using the reviewed local `-skills` sister projects under `workplace/refs-40` as shape references when repository structure changes.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
