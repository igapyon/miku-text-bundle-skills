# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v0.5.1`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v0.5.1>
- Asset: `miku-text-bundle-0.5.1.mjs`
- Asset digest: `sha256:edd2e376ca44187ecab58a86e632be5383e1d8009b2eec9976655954bf405146`
- Source asset: `miku-text-bundle-sources-0.5.1.tgz`
- Source asset digest: `sha256:d719c46396e12af9e3c12f12a1f23a7ceab58f9e4d6e1185e6d5efdebb44bc74`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v0.5.0.2>
- Asset: `miku-text-bundle-java-0.5.0.2.jar`
- Asset digest: `sha256:af2f5677aa82b706e0da99c2f1260cdbc9fd497d985a083621cd132906d85e5b`
- Source asset: `miku-text-bundle-java-sources-0.5.0.2.jar`
- Source asset digest: `sha256:df8b7a510a25292d7ec642c849f19944d4a23c5e0e4e94be1025568a100a4e31`

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

The Node artifact declares CLI version `0.5.1`. The Java artifact responds to `--version`, but its output is `miku-text-bundle-java 0.5.0`.

## Upstream CLI Contract

The received Node source artifact for `v0.5.1` includes the upstream `README.md`,
`TODO.md`, TypeScript source, tests, and design notes. The README and runtime
`--help` output describe this core behavior:

- collect text files under an input directory and emit split Markdown bundles for generative AI handoff
- write to `workplace/miku-text-bundle/<yyyyMMddHHmm>/` under the input directory when the output directory is omitted
- generate `text-bundle-000-index.md`, one or more `text-bundle-*.md` part files, and `text-bundle-000-prompt.md`
- default `--max-chars` to `120000`
- default `--max-input-file-bytes` to `1000000`
- accept `--include` and `--exclude` as comma-separated glob lists
- skip files that are binary, non-UTF-8, over the single-file byte limit, ignored by the input-root `.gitignore`, or under repository-root dot directories
- record skipped files, warnings, and extracted `TODO` / `FIXME` / `XXX` markers in the index file

The upstream `.gitignore` support is intentionally limited. It reads only the
input-root `.gitignore`, does not implement full Git ignore semantics, and does
not let include patterns restore `.gitignore`-excluded files or root dot
directory files.

The Java companion artifact is treated as the preferred execution runtime for
this skill, but the Node artifact remains the compatibility source for upstream
`miku-text-bundle` release `v0.5.1`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
