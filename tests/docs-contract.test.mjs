import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";

const docs = {
  readme: read("README.md"),
  mikuSoftReference: read("docs/miku-soft-reference.md"),
  releaseWorkflow: read(".github/workflows/release-build.yml"),
  skill: read("skills/igapyon-miku-text-bundle/SKILL.md"),
  skillIndexJson: read("skills/igapyon-miku-text-bundle/index.json"),
  index: read("skills/igapyon-miku-text-bundle/references/INDEX.md"),
  workflow: read("skills/igapyon-miku-text-bundle/references/workflow.md"),
  upstream: read("skills/igapyon-miku-text-bundle/references/upstream.md"),
  operationsMap: read("skills/igapyon-miku-text-bundle/references/runtime/operations-map.md")
};

test("documents consistently declare CLI-backed Java-first operation without MCP fallback", () => {
  for (const [name, text] of Object.entries(docs)) {
    assert.match(text, /miku-text-bundle/, `${name} should mention miku-text-bundle`);
    assert.doesNotMatch(text, /mcp-only|mcp-preferred/, `${name} must not document MCP backend policies`);
  }

  assert.match(docs.readme, /Java first|Java is the default|Runtime selection: Java first/);
  assert.match(docs.skill, /Prefer Java runtime first/);
  assert.match(docs.workflow, /default runtime backend is `java`/);
  assert.match(docs.operationsMap, /Java is the default backend/);
});

test("documents expected runtime artifact names and generated output roles", () => {
  for (const artifact of [
    "miku-text-bundle-java-1.5.0.jar",
    "miku-text-bundle-1.5.1.mjs"
  ]) {
    const pattern = new RegExp(escapeRegExp(artifact));
    assert.match(docs.readme, pattern);
    assert.match(docs.upstream, pattern);
    assert.match(docs.operationsMap, pattern);
  }

  for (const role of [
    "bundle_part_markdown",
    "bundle_prompt_markdown",
    "bundle_terminal_index_markdown"
  ]) {
    assert.match(docs.operationsMap, new RegExp(role));
  }
  assert.match(docs.operationsMap, /knowledge_part_markdown/);
  assert.match(docs.operationsMap, /knowledge_management_index_markdown/);
});

test("node and java runtime help text is identical", () => {
  const nodeHelp = execFileSync("node", [
    "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.5.1.mjs",
    "--help"
  ], { encoding: "utf8" }).trimEnd();
  const javaHelp = execFileSync("java", [
    "-jar",
    "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.5.0.jar",
    "--help"
  ], { encoding: "utf8" }).trimEnd();

  assert.equal(javaHelp, nodeHelp);

  for (const option of [
    "--input <dir>",
    "--output <dir>",
    "--mode handoff|knowledge-source",
    "--encoding utf-8|shift_jis",
    "--encoding-extension",
    "--filename-prefix <prefix>",
    "--version"
  ]) {
    assert.match(javaHelp, new RegExp(escapeRegExp(option)));
    assert.match(nodeHelp, new RegExp(escapeRegExp(option)));
  }
  assert.match(docs.workflow, /identical `--help` output/);
  assert.match(docs.operationsMap, /Supported option names/);
});

test("reference index links to workflow, upstream, and operations map", () => {
  assert.match(docs.index, /\[workflow\.md\]\(workflow\.md\)/);
  assert.match(docs.index, /\[upstream\.md\]\(upstream\.md\)/);
  assert.match(docs.index, /\[runtime\/operations-map\.md\]\(runtime\/operations-map\.md\)/);
});

test("generated skill discovery index covers primary skill files", () => {
  const indexJson = JSON.parse(docs.skillIndexJson);
  assert.equal(indexJson.generator, "miku-indexgen");
  assert.equal(indexJson.title, "igapyon-miku-text-bundle Skill Index");
  assert.match(docs.skill, /Read `index\.json` first/);
  assert.match(docs.skill, /runtime `--help` output as the primary CLI contract/);

  const indexedPaths = new Set(indexJson.files.map((file) => file.path));
  for (const filePath of [
    "SKILL.md",
    "agents/openai.yaml",
    "lib/runtime-artifacts.mjs",
    "references/INDEX.md",
    "references/upstream.md",
    "references/workflow.md",
    "references/runtime/operations-map.md",
    "runtime/miku-text-bundle-1.5.1.mjs"
  ]) {
    assert.ok(indexedPaths.has(filePath), `missing index entry: ${filePath}`);
  }
});

test("repository links to shared miku-soft guidance instead of copying basic documents", () => {
  assert.match(docs.readme, /\[docs\/miku-soft-reference\.md\]\(docs\/miku-soft-reference\.md\)/);
  assert.match(docs.mikuSoftReference, /igapyon-miku-soft-developer/);
  assert.match(docs.mikuSoftReference, /40-agent-skills-workflow\.md/);
  assert.doesNotMatch(docs.mikuSoftReference, /miku-soft-40-agentskills-design-v\d+\.md/);
});

test("release workflow verifies declared runtimes and uploads versioned bundle zip", () => {
  assert.match(docs.releaseWorkflow, /miku-text-bundle-java-1\.5\.0\.jar/);
  assert.match(docs.releaseWorkflow, /miku-text-bundle-1\.5\.1\.mjs/);
  assert.match(docs.releaseWorkflow, /npm run build/);
  assert.match(docs.releaseWorkflow, /igapyon-miku-text-bundle-skills-\$\{\{ steps\.release_version\.outputs\.version \}\}\.zip/);
  assert.match(docs.releaseWorkflow, /softprops\/action-gh-release@v2/);
});

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
