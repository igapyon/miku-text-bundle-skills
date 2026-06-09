# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.0.0`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.0.0>
- Asset: `miku-text-bundle-1.0.0.mjs`
- Asset digest: `sha256:32b68c9a5b9b8f04949ab4ad57c5b4b6787ac3e2287ce82301fbc976a9ca01ba`
- Source asset: `miku-text-bundle-sources-1.0.0.tgz`
- Source asset digest: `sha256:73bc2c70ea69b73845aecdce829f6de119dc3e0fd861c4f022237852e9abbd84`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.0.0>
- Asset: `miku-text-bundle-java-1.0.0.jar`
- Asset digest: `sha256:b64f2df035d731f79800998b382367da679a918d91048f35ef633a0c66c74769`
- Source asset: `miku-text-bundle-java-sources-1.0.0.jar`
- Source asset digest: `sha256:e986a417c7a3ad35707cf9b7338eff3dc23aca3f5f6bc53947674f73e571c390`

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

The Node `v1.0.0` and Java `v1.0.0` runtime artifacts also accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both the Node and Java artifacts respond to `--version` with `1.0.0`.

## Upstream CLI Contract

The received Node source artifact for `v1.0.0` includes the upstream `README.md`,
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
`miku-text-bundle` release `v1.0.0`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
