# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v0.5.3`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v0.5.3>
- Asset: `miku-text-bundle-0.5.3.mjs`
- Asset digest: `sha256:1e593b841caf7f1a30fd605399488f57f3dd2255a4ad31e445dafeaccf382fec`
- Source asset: `miku-text-bundle-sources-0.5.3.tgz`
- Source asset digest: `sha256:e40478bc8f0e4cb026caf7ef1554479572608762863791cbde796cd607fd0229`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v0.5.3>
- Asset: `miku-text-bundle-java-0.5.3.jar`
- Asset digest: `sha256:261bd08af4870029063b981a9f2951a3d8641de638e26f1b4d35d504ed55a64e`
- Source asset: `miku-text-bundle-java-sources-0.5.3.jar`
- Source asset digest: `sha256:2ec6b45362e3f28b4f13a2fa7048152323a83c71838295b575d938e7f696ebd4`

## Runtime Artifact Policy

Runtime artifacts are expected under:

```text
skills/miku-text-bundle/runtime/
```

Do not search broadly through the workspace for product runtimes before checking this declared runtime directory.

## Runtime Smoke Notes

Both runtime artifacts accept the same basic CLI shape:

```text
miku-text-bundle <inputDir> [outputDir] [--max-chars 120000] [--max-input-file-bytes 1000000] [--include "glob"] [--exclude "glob"] [--verbose]
miku-text-bundle --input-directory <dir> [--output-directory <dir>] [--max-chars 120000] [--max-input-file-bytes 1000000]
```

In `v0.5.3`, both runtime artifacts also accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

The Node artifact declares CLI version `0.5.3`. The Java artifact responds to `--version` with `miku-text-bundle-java 0.5.3`.

## Upstream CLI Contract

The received Node source artifact for `v0.5.3` includes the upstream `README.md`,
`TODO.md`, TypeScript source, tests, and design notes. The README and runtime
`--help` output describe this core behavior:

- collect text files under an input directory and emit split Markdown bundles for generative AI handoff
- write to `workplace/miku-text-bundle/<yyyyMMddHHmm>/` under the input directory when the output directory is omitted
- generate `text-bundle-000-index.md`, one or more `text-bundle-*.md` part files, and `text-bundle-000-prompt.md`
- default `--max-chars` to `120000`
- default `--max-input-file-bytes` to `1000000`
- accept `--encoding utf-8|shift_jis` for the default input text encoding
- accept `--encoding-extension ".ext=shift_jis"` for extension-specific input encoding
- accept `--include` and `--exclude` as comma-separated glob lists
- skip files that are binary, non-UTF-8, over the single-file byte limit, ignored by the input-root `.gitignore`, or under repository-root dot directories
- record skipped files, warnings, and extracted `TODO` / `FIXME` / `XXX` markers in the index file

The upstream `.gitignore` support is intentionally limited. It reads only the
input-root `.gitignore`, does not implement full Git ignore semantics, and does
not let include patterns restore `.gitignore`-excluded files or root dot
directory files.

The Java companion artifact is treated as the preferred execution runtime for
this skill, but the Node artifact remains the compatibility source for upstream
`miku-text-bundle` release `v0.5.3`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
