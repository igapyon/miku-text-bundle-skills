# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v1.5.1`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v1.5.1>
- Asset: `miku-text-bundle-1.5.1.mjs`
- Asset digest: `sha256:2bb9bebc9344253375141736ca435309724da8f2a26caf7bf0120abcc22bd45c`
- Source asset: `miku-text-bundle-sources-1.5.1.tgz`
- Source asset digest: `sha256:8a64adbef4afeb58321a9b702225cead552f3617294ad2d3e515650116b44fab`

The Java companion runtime is anchored separately.

- Repository: <https://github.com/igapyon/miku-text-bundle-java>
- Release: <https://github.com/igapyon/miku-text-bundle-java/releases/tag/v1.5.0>
- Asset: `miku-text-bundle-java-1.5.0.jar`
- Asset digest: `sha256:77315a89f0d9f474d67aeddc964b7cca350af7557068c3f905c533d8532d410a`
- Source asset: `miku-text-bundle-java-sources-1.5.0.jar`
- Source asset digest: `sha256:85513027da929967cdbd79225acb3365b4524b3629195033cadd7e89f5810199`

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

The Node runtime reports CLI version `1.5.1`; the Java runtime reports `1.5.0`.
Both accept explicit input encoding
options:

```text
--encoding utf-8|shift_jis
--encoding-extension ".java=shift_jis"
```

Both runtime artifacts successfully execute `--mode knowledge-source` and
expose identical `--help` output.

## Upstream CLI Contract

The received Node source artifact for `v1.5.1` includes the upstream `README.md`,
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
`miku-text-bundle` release `v1.5.1`.

## Remaining Follow-Ups

- Compare with a similar local `-skills` sister project checkout when one is placed under `workplace/`.
- Keep checking future upstream releases before changing artifact names, digests, runtime selection, or documented CLI behavior.
