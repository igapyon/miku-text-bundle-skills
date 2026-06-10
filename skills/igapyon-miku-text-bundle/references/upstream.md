# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.0.1`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.0.1>
- Asset: `miku-text-bundle-1.0.1.mjs`
- Asset digest: `sha256:c5ce6034b7f50f1977a3d0523ed1ec93748a1e7100af69596070d5b83c233d59`
- Source asset: `miku-text-bundle-sources-1.0.1.tgz`
- Source asset digest: `sha256:bd3d0d5ca24f146160d146aba24e6f63b6d72da821bd6a3310812733077d2473`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.0.1>
- Asset: `miku-text-bundle-java-1.0.1.jar`
- Asset digest: `sha256:66d654cf1452e77deddd7893be288f16d4e0408cac57489b8a6c0ae98898c61f`
- Source asset: `miku-text-bundle-java-sources-1.0.1.jar`
- Source asset digest: `sha256:3fdc1e3b57cdfddd429d997d3b0f4ba58100aeb62333a66185ee7eaaf3657e4c`

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

The Node `v1.0.1` and Java `v1.0.1` runtime artifacts also accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both the Node and Java artifacts respond to `--version` with `1.0.1`.

## Upstream CLI Contract

The received Node source artifact for `v1.0.1` includes the upstream `README.md`,
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
`miku-text-bundle` release `v1.0.1`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
