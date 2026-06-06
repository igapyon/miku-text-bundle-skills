# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v0.9.0`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v0.9.0>
- Asset: `miku-text-bundle-0.9.0.mjs`
- Asset digest: `sha256:75a9c569fac92eac6564cf3f07ea902d12f37eab3628ff03c9732666dab4a571`
- Source asset: `miku-text-bundle-sources-0.9.0.tgz`
- Source asset digest: `sha256:71d234709213bcc77e13d5f2251a0edd4c037a14b8a8dfb33d17f99561690514`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v0.9.0>
- Asset: `miku-text-bundle-java-0.9.0.jar`
- Asset digest: `sha256:3b2f38f07215d98e3073f9dca8b4ff57e5e847564cbf77b6984d95eb497f65c3`
- Source asset: `miku-text-bundle-java-sources-0.9.0.jar`
- Source asset digest: `sha256:198b43ec23ee140947d53e93c88623a55d5d05646c70bac99f030c06ccda9a23`

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

The Node `v0.9.0` and Java `v0.9.0` runtime artifacts also accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both the Node and Java artifacts respond to `--version` with `0.9.0`.

## Upstream CLI Contract

The received Node source artifact for `v0.9.0` includes the upstream `README.md`,
`TODO.md`, TypeScript source, tests, and design notes. The README and runtime
`--help` output describe this core behavior:

- collect text files under an input directory and emit split Markdown bundles for generative AI handoff
- require the output directory to be specified with `--output`
- generate `text-bundle-999-index.md`, one or more `text-bundle-*.md` part files, and `text-bundle-000-prompt.md`
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
`miku-text-bundle` release `v0.9.0`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
