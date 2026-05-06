# Upstream Anchor

This skill is tied to the upstream main application:

- Repository: <https://github.com/igapyon/miku-text-bundle>
- Compatibility source: release `v0.5.0.3`
- Runtime artifacts: received
- Current execution pattern: CLI-backed initial skeleton

The repository URL and release tag are the compatibility anchor for the Node runtime.

- Release: <https://github.com/igapyon/miku-text-bundle/releases/tag/v0.5.0.3>
- Asset: `miku-text-bundle-0.5.0.3.mjs`
- Asset digest: `sha256:fa52a17cdb992a24ab9fbc08df833aa3519c3d2d88297671668cf07dc21bd73c`
- Source asset: `miku-text-bundle-sources-0.5.0.3.tgz`
- Source asset digest: `sha256:ae4ee83ed80c57316eb97f3d8a78ef01916d7005bff2e970d105b742e9450d3b`

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

The Node artifact does not support `--version` in `v0.5.0.3`. The Java artifact responds to `--version`, but its output is `miku-text-bundle-java 0.5.0`.

## Remaining Unknowns

The upstream README, supported input formats, supported output formats, full CLI/API surface, diagnostics, and limitations still need a detailed review.
