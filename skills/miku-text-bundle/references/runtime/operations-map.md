# Operations Map

Use this reference when you need the supported operation list or the preferred
CLI runtime surface for `miku-text-bundle`.

## Operations

- `bundle`: collect input-directory text files and generate Markdown handoff
  files under the selected output directory
- `version`: check that a runtime artifact starts and identifies itself
- `help`: read the runtime CLI contract

## Runtime Search Order

Prefer the bundled runtime artifacts in this repository:

- `skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.0.2.jar`
- `skills/miku-text-bundle/runtime/miku-text-bundle-0.5.1.mjs`

Check these declared paths and SHA-256 digests before broad workspace
exploration. Java is the default backend. Use Node.js when Java is unavailable
or unusable.

## Preferred Runtime Surface

List Java examples before Node.js examples so agents see the preferred runtime
first.

```bash
java -jar skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.0.2.jar <inputDir> <outputDir>
node skills/miku-text-bundle/runtime/miku-text-bundle-0.5.1.mjs <inputDir> <outputDir>
```

Named directory options are also supported:

```bash
java -jar skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.0.2.jar --input-directory <dir> --output-directory <dir>
node skills/miku-text-bundle/runtime/miku-text-bundle-0.5.1.mjs --input-directory <dir> --output-directory <dir>
```

Meta commands:

```bash
java -jar skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.0.2.jar --version
node skills/miku-text-bundle/runtime/miku-text-bundle-0.5.1.mjs --version
```

## CLI Operation Correspondence

| Agent Skill operation | CLI backend shape | Notes |
| --- | --- | --- |
| `bundle` | `<inputDir> <outputDir>` or named directory options | Primary Markdown handoff generation operation. |
| `version` | `--version` | Smoke check only. Java output may differ from the artifact file version. |
| `help` | `--help` | Runtime contract reference. |

## Artifact Roles

- `bundle_input_directory`
- `bundle_output_directory`
- `bundle_index_markdown`
- `bundle_part_markdown`
- `bundle_prompt_markdown`
- `operation_summary`
- `diagnostics_log`

Do not treat the generated Markdown files as interchangeable. The index,
prompt, and part files have different handoff roles and should be reported
separately when summarizing a run.
