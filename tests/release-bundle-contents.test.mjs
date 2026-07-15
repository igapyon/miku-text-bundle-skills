import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const ROOT = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));
const zipPath = path.resolve(
  ROOT,
  `bundle/igapyon-miku-text-bundle-skills-${packageJson.version}.zip`
);

test("release zip contains skill files and excludes development-only files", () => {
  execFileSync("npm", ["run", "build:bundle:zip"], {
    cwd: ROOT,
    encoding: "utf8"
  });

  assert.equal(fs.existsSync(zipPath), true);

  const entries = execFileSync("unzip", ["-Z1", zipPath], {
    cwd: ROOT,
    encoding: "utf8"
  }).trim().split(/\n/).filter(Boolean);

  assertIncludes(entries, "skills/igapyon-miku-text-bundle/SKILL.md");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/index.json");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/agents/openai.yaml");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/references/INDEX.md");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/references/upstream.md");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/references/workflow.md");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/references/runtime/operations-map.md");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.4.0.mjs");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-sources-1.4.0.tgz");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.4.0.jar");
  assertIncludes(entries, "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-sources-1.4.0.jar");

  assert.equal(entries.some((entry) => entry.includes(".DS_Store")), false);
  assert.equal(entries.some((entry) => entry.includes(".gitkeep")), false);
  assert.equal(entries.some((entry) => entry.startsWith("tests/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("docs/")), false);
  assert.equal(entries.some((entry) => entry.startsWith(".github/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("bundle/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("workplace/")), false);
  assert.equal(entries.some((entry) => entry.includes("node_modules/")), false);
});

function assertIncludes(entries, expected) {
  assert.ok(entries.includes(expected), `missing zip entry: ${expected}`);
}
