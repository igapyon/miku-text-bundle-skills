# Operations Map

Use this reference when you need the supported operation list or the preferred
CLI runtime surface for `miku-text-bundle`.

## Operations

- `bundle`: collect input-directory text files and generate Markdown handoff
  files under the selected output directory
- `version`: check that a runtime artifact starts and identifies itself
- `help`: read the runtime CLI contract

For v1.0.1, Node.js and Java help text is equivalent.

## Runtime Search Order

Prefer the bundled runtime artifacts in this repository:

- `skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.0.1.jar`
- `skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.0.1.mjs`

Check these declared paths and SHA-256 digests before broad workspace
exploration. Java is the default backend. Use Node.js when Java is unavailable
or unusable.

## Preferred Runtime Surface

List Java examples before Node.js examples so agents see the preferred runtime
first.

```bash
java -jar skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.0.1.jar --input <inputDir> --output <outputDir>
node skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.0.1.mjs --input <inputDir> --output <outputDir>
```

Input encoding can be specified when needed:

```bash
java -jar skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.0.1.jar --input <inputDir> --output <outputDir> --encoding shift_jis
node skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.0.1.mjs --input <inputDir> --output <outputDir> --encoding-extension ".java=shift_jis"
```

Supported option names:

- `--filename-prefix <prefix>`
- `--max-chars <number>`
- `--max-input-file-bytes <number>`
- `--encoding utf-8|shift_jis`
- `--encoding-extension ".ext=shift_jis"`
- `--add-exclude-extension ".ext"`
- `--remove-exclude-extension ".ext"`
- `--add-exclude-directory "dir"`
- `--remove-exclude-directory "dir"`
- `--verbose`

Meta commands:

```bash
java -jar skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.0.1.jar --version
node skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.0.1.mjs --version
```

## CLI Operation Correspondence

| Agent Skill operation | CLI backend shape | Notes |
| --- | --- | --- |
| `bundle` | `--input <inputDir> --output <outputDir>` | Primary Markdown handoff generation operation. Supports explicit input encoding options such as `--encoding shift_jis`. |
| `version` | `--version` | Smoke check only. Java output may differ from the artifact file version. |
| `help` | `--help` | Runtime contract reference. |

## Artifact Roles

- `bundle_input_directory`: source directory scanned by the runtime
- `bundle_output_directory`: destination directory created or updated by the runtime
- `bundle_index_markdown`: `<prefix>-999-index.md`, file list, skipped-file diagnostics, warnings, and summary
- `bundle_prompt_markdown`: `<prefix>-000-prompt.md`, prompt-oriented handoff guidance; recommended to paste into the AI Web UI message body first for stability
- `bundle_part_markdown`: `<prefix>-001.md` through `<prefix>-998.md`, bundled source text parts
- `operation_summary`: runtime stdout completion summary
- `diagnostics_log`: stderr or index-file diagnostics when execution fails or skips files

Do not treat the generated Markdown files as interchangeable. The index,
prompt, and part files have different handoff roles and should be reported
separately when summarizing a run.
