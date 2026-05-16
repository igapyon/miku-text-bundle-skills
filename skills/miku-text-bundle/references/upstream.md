# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v0.8.1`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v0.8.1>
- Asset: `miku-text-bundle-0.8.1.mjs`
- Asset digest: `sha256:75d019015f69cde82ef07a465e27166d0e58e35e1db641d9758d64f429ea47f9`
- Source asset: `miku-text-bundle-sources-0.8.1.tgz`
- Source asset digest: `sha256:56be544a8a516e8b25f10ade0e50fbdcaea01705dd5adc66a4b5b4a31eada94b`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v0.8.0>
- Asset: `miku-text-bundle-java-0.8.0.jar`
- Asset digest: `sha256:bb2b7f248987f4bedfdb7abe36f41cbbc0ae013aae174bef37c51ae8d1e5e5db`
- Source asset: `miku-text-bundle-java-sources-0.8.0.jar`
- Source asset digest: `sha256:c7886d8e98c514278906d791ee6a586a4a2976f25cfb89d073cdf79d8c8762d9`

## Runtime Artifact Policy

Runtime artifacts are expected under:

```text
skills/miku-text-bundle/runtime/
```

Do not search broadly through the workspace for product runtimes before checking this declared runtime directory.

## Runtime Smoke Notes

Both runtime artifacts accept the same basic CLI shape:

```text
miku-text-bundle --input <dir> --output <dir> [--max-chars 120000] [--max-input-file-bytes 1000000] [--verbose]
```

The Node `v0.8.1` and Java `v0.8.0` runtime artifacts also accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

The Node artifact declares CLI version `0.8.1`. The Java artifact responds to `--version` with `miku-text-bundle-java 0.8.0`.

## Upstream CLI Contract

The received Node source artifact for `v0.8.1` includes the upstream `README.md`,
`TODO.md`, TypeScript source, tests, and design notes. The README and runtime
`--help` output describe this core behavior:

- collect text files under an input directory and emit split Markdown bundles for generative AI handoff
- require the output directory to be specified with `--output`
- generate `text-bundle-000-index.md`, one or more `text-bundle-*.md` part files, and `text-bundle-000-prompt.md`
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
`miku-text-bundle` release `v0.8.1`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
