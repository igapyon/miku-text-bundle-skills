import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import {
  defaultRuntimeBackend,
  planRuntimeSelection,
  resolveRuntime
} from "../skills/miku-text-bundle/lib/runtime-artifacts.mjs";

const root = process.cwd();
const smokeRoot = path.join(root, "workplace", "runtime-smoke-auto");
const inputDir = path.join(smokeRoot, "input");
const expectedOutputs = [
  "text-bundle-999-index.md",
  "text-bundle-000-prompt.md",
  "text-bundle-001.md"
];

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}\n${stdout}\n${stderr}`));
      }
    });
  });
}

async function prepareFixture() {
  await rm(smokeRoot, { recursive: true, force: true });
  await mkdir(inputDir, { recursive: true });
  await writeFile(
    path.join(inputDir, "README.md"),
    "# Smoke Fixture\n\nhello miku-text-bundle\n",
    "utf8"
  );
}

async function runBackend(backend) {
  const runtime = await resolveRuntime(root, backend);
  const outputDir = path.join(smokeRoot, `${backend}-output`);
  await mkdir(outputDir, { recursive: true });
  const [command, ...args] = runtime.command(runtime.path, inputDir, outputDir, [
    "--max-chars",
    "120000"
  ]);
  const result = await runCommand(command, args);

  for (const file of expectedOutputs) {
    await readFile(path.join(outputDir, file), "utf8");
  }

  const bundle = await readFile(path.join(outputDir, "text-bundle-001.md"), "utf8");
  if (!bundle.includes("hello miku-text-bundle")) {
    throw new Error(`${backend} smoke output did not include fixture content.`);
  }
  if (!result.stdout.includes("completed: 1 part(s), 1 file(s) collected")) {
    throw new Error(`${backend} smoke stdout did not include completion summary.`);
  }

  return {
    backend,
    outputDir,
    stdout: result.stdout.trim()
  };
}

await prepareFixture();
const defaultPlan = await planRuntimeSelection({ root });
if (defaultPlan.selectedBackend !== defaultRuntimeBackend) {
  throw new Error(`Default runtime backend should be ${defaultRuntimeBackend}.`);
}

const fallbackPlan = await planRuntimeSelection({
  root,
  unavailableBackends: ["java"]
});
if (fallbackPlan.selectedBackend !== "node") {
  throw new Error("Runtime selection should fall back to node when java is unavailable.");
}
if (fallbackPlan.fallback?.from !== "java" || fallbackPlan.fallback?.to !== "node") {
  throw new Error("Runtime fallback diagnostics should report java -> node.");
}

const results = [];
for (const backend of ["java", "node"]) {
  results.push(await runBackend(backend));
}

for (const result of results) {
  console.log(`${result.backend} runtime smoke OK: ${result.outputDir}`);
}
