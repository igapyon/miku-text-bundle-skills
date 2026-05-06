# miku-text-bundle Agent Workflow

This initial workflow is CLI-backed through received upstream runtime artifacts.

The initial version has no MCP backend. Do not call MCP tools as an automatic fallback for `miku-text-bundle` operations.

## CLI-Backed Flow

1. Confirm the user explicitly requested `miku-text-bundle` or `miku-text-bundle-skills`.
2. Confirm the input directory, output directory, and options.
3. Check `runtime/` for the declared Node and Java artifacts before looking anywhere else.
4. Prefer the Java runtime for operations it supports.
5. Use the Node.js runtime when Java is missing or unusable.
6. Run the selected runtime artifact with the requested input and output paths.
7. Report generated files, collected file count, part count, warnings, and errors.

## Runtime Commands

Runtime lookup and digest verification are defined in `lib/runtime-artifacts.mjs`.
The default runtime backend is `java`; fallback runtime order is `java`, then `node`.

Node runtime:

```sh
node skills/miku-text-bundle/runtime/miku-text-bundle-0.5.0.3.mjs <inputDir> <outputDir>
```

Java runtime:

```sh
java -jar skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.0.2.jar <inputDir> <outputDir>
```

The initial smoke check generated:

- `text-bundle-000-index.md`
- `text-bundle-001.md`
- `text-bundle-000-prompt.md`

Keep helper code thin. The skill may locate runtimes, build command arguments, run the upstream CLI, and format diagnostics, but product behavior belongs upstream.
