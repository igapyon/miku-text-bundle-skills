# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.3.0`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.3.0>
- Asset: `miku-text-bundle-1.3.0.mjs`
- Asset digest: `sha256:ec06894eac20afb9405e06916bddde27b401d0ff5ce2409ad43eb9b0a8cc36b5`
- Source asset: `miku-text-bundle-sources-1.3.0.tgz`
- Source asset digest: `sha256:c822dfada3f79300795ac316de68e53e0e7b204255a76b17f693be1d47db0570`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.3.0>
- Asset: `miku-text-bundle-java-1.3.0.jar`
- Asset digest: `sha256:2d02c7b9e9915e608cad522ad3d69754e61d4d035803441c2f216c2179502181`
- Source asset: `miku-text-bundle-java-sources-1.3.0.jar`
- Source asset digest: `sha256:c308b53abce20179a0a0706e21f45ae90acd17eb7367c7910287f79e6fb35dd7`

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

The Node and Java runtime artifacts report CLI version `1.3.0` and accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both the Node and Java artifacts respond to `--version` with `1.3.0`.

## Upstream CLI Contract

The received Node source artifact for `v1.3.0` includes the upstream `README.md`,
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
`miku-text-bundle` release `v1.3.0`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
