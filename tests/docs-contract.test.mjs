import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const docs = {
  readme: read("README.md"),
  releaseWorkflow: read(".github/workflows/release-build.yml"),
  skill: read("skills/miku-text-bundle/SKILL.md"),
  index: read("skills/miku-text-bundle/references/INDEX.md"),
  workflow: read("skills/miku-text-bundle/references/workflow.md"),
  upstream: read("skills/miku-text-bundle/references/upstream.md"),
  operationsMap: read("skills/miku-text-bundle/references/runtime/operations-map.md")
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
    "miku-text-bundle-java-0.9.0.jar",
    "miku-text-bundle-0.9.0.mjs"
  ]) {
    const pattern = new RegExp(escapeRegExp(artifact));
    assert.match(docs.readme, pattern);
    assert.match(docs.upstream, pattern);
    assert.match(docs.operationsMap, pattern);
  }

  for (const role of [
    "bundle_index_markdown",
    "bundle_part_markdown",
    "bundle_prompt_markdown"
  ]) {
    assert.match(docs.operationsMap, new RegExp(role));
  }
});

test("reference index links to workflow, upstream, and operations map", () => {
  assert.match(docs.index, /\[workflow\.md\]\(workflow\.md\)/);
  assert.match(docs.index, /\[upstream\.md\]\(upstream\.md\)/);
  assert.match(docs.index, /\[runtime\/operations-map\.md\]\(runtime\/operations-map\.md\)/);
});

test("release workflow verifies declared runtimes and uploads versioned bundle zip", () => {
  assert.match(docs.releaseWorkflow, /miku-text-bundle-java-0\.9\.0\.jar/);
  assert.match(docs.releaseWorkflow, /miku-text-bundle-0\.9\.0\.mjs/);
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
