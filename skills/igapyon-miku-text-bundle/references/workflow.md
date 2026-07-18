# miku-text-bundle Agent Workflow

This initial workflow is CLI-backed through received upstream runtime artifacts.

The initial version has no MCP backend. Do not call MCP tools as an automatic fallback for `miku-text-bundle` operations.

## CLI-Backed Flow

1. Confirm the user explicitly requested `igapyon-miku-text-bundle`, `miku-text-bundle`, or `miku-text-bundle-skills`.
2. Confirm the input directory, output directory, and options.
3. Check `runtime/` for the declared Node and Java artifacts before looking anywhere else.
4. Prefer the Java runtime for operations it supports.
5. Use the Node.js runtime when Java is missing or unusable.
6. Run the selected runtime artifact with the requested input and output paths.
7. Report generated files, collected file count, part count, warnings, and errors.

Supported operations and artifact roles are summarized in
[runtime/operations-map.md](runtime/operations-map.md).

## Agent Result Checklist

After a successful run, report:

- runtime backend used: `java` or `node`
- input directory and output directory
- selected mode: `handoff` or `knowledge-source`
- handoff guidance: send part files in filename order, starting with `<prefix>-001.md`; the first part embeds the prompt instructions and the final part embeds the index
- knowledge-source guidance: use `<prefix>-001.md` onward as neutral content sources and keep `<prefix>-index.md` as the separate management and diagnostics index
- generated files:
  - `<prefix>-001.md` through `<prefix>-998.md` as present
  - `<prefix>-999.md` when enough parts are generated
- collected file count and part count from runtime stdout
- skipped-file diagnostics and warnings recorded in the index file

If execution fails, report the backend attempted, exit status, stderr summary,
and whether fallback to Node.js was attempted.

## Runtime Commands

Runtime lookup and digest verification are defined in `lib/runtime-artifacts.mjs` under this skill directory.
The default runtime backend is `java`; fallback runtime order is `java`, then `node`.

Node runtime:

```sh
node skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.6.0.mjs --input <inputDir> --output <outputDir>
```

Java runtime:

```sh
java -jar skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.6.0.jar --input <inputDir> --output <outputDir>
```

Both runtimes support explicit input encoding options, including
`--encoding shift_jis` and extension-specific rules such as
`--encoding-extension ".java=shift_jis"`.

Node v1.6.0 and Java v1.6.0 expose identical `--help` output.
Treat `--help` as the runtime contract when option behavior needs confirmation.

The initial smoke check generated:

- `text-bundle-001.md`

For Web UI handoff, it is recommended to treat
`text-bundle-001.md` as the first handoff file. It contains the prompt section
when it is the first part, and the final part contains the index section. In a
one-part bundle, `text-bundle-001.md` contains both sections.

Keep helper code thin. The skill may locate runtimes, build command arguments, run the upstream CLI, and format diagnostics, but product behavior belongs upstream.
