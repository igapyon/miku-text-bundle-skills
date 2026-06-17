import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

import {
  planRuntimeSelection,
  resolveRuntime
} from "../skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const buildScriptPath = path.resolve(ROOT, "scripts/build-skill-bundle.mjs");

test("builds bundle and runs runtime artifacts from isolated install tree", async () => {
  execFileSync("node", [buildScriptPath], {
    cwd: ROOT,
    encoding: "utf8"
  });

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-text-bundle-bundle-test-"));
  try {
    fs.cpSync(path.resolve(ROOT, "bundle/miku-text-bundle-skills/skills"), path.resolve(tempRoot, "skills"), {
      recursive: true
    });

    const defaultPlan = await planRuntimeSelection({ root: tempRoot });
    assert.equal(defaultPlan.selectedBackend, "java");

    const fallbackPlan = await planRuntimeSelection({
      root: tempRoot,
      unavailableBackends: ["java"]
    });
    assert.equal(fallbackPlan.selectedBackend, "node");
    assert.deepEqual(fallbackPlan.fallback, {
      from: "java",
      to: "node",
      reason: "runtime_unavailable"
    });

    const inputDir = path.resolve(tempRoot, "input");
    fs.mkdirSync(inputDir, { recursive: true });
    fs.writeFileSync(path.resolve(inputDir, "README.md"), "# Bundle Smoke\n\nhello bundled skill\n");

    for (const backend of ["java", "node"]) {
      const runtime = await resolveRuntime(tempRoot, backend);
      const outputDir = path.resolve(tempRoot, `${backend}-output`);
      fs.mkdirSync(outputDir, { recursive: true });
      const [command, ...args] = runtime.command(runtime.path, inputDir, outputDir);
      execFileSync(command, args, {
        cwd: tempRoot,
        encoding: "utf8"
      });
      assert.equal(fs.existsSync(path.resolve(outputDir, "text-bundle-001.md")), true);
      const bundle = fs.readFileSync(path.resolve(outputDir, "text-bundle-001.md"), "utf8");
      assert.match(bundle, /hello bundled skill/);
      assert.match(bundle, /prompt: true/);
      assert.match(bundle, /terminal: true/);
      assert.match(bundle, /# Text Bundle Prompt/);
      assert.match(bundle, /# Text Bundle Index/);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
