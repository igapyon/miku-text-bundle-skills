#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  allArtifactSpecs,
  resolveArtifact
} from "../skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const bundleRoot = path.resolve(repoRoot, "bundle/miku-text-bundle-skills");
const bundleSkillsRoot = path.resolve(bundleRoot, "skills");
const sourceSkillRoot = path.resolve(repoRoot, "skills/igapyon-miku-text-bundle");

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});

async function main() {
  ensureSourceExists(sourceSkillRoot, "skills/igapyon-miku-text-bundle");

  const artifactPaths = [];
  for (const artifact of allArtifactSpecs()) {
    artifactPaths.push(await resolveArtifact(repoRoot, artifact));
  }

  fs.rmSync(bundleRoot, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100
  });
  fs.mkdirSync(bundleSkillsRoot, { recursive: true });

  const bundleSkillRoot = path.resolve(bundleSkillsRoot, "igapyon-miku-text-bundle");
  fs.cpSync(sourceSkillRoot, bundleSkillRoot, {
    recursive: true,
    filter: shouldCopyBundleEntry
  });

  process.stdout.write([
    "[build:bundle] generated bundle/miku-text-bundle-skills",
    "[build:bundle] copy this directory's contents under your skill home root",
    "[build:bundle] included:",
    "  - skills/igapyon-miku-text-bundle",
    ...artifactPaths.map((artifactPath) => {
      const name = path.basename(artifactPath);
      return `  - skills/igapyon-miku-text-bundle/runtime/${name}`;
    })
  ].join("\n"));
  process.stdout.write("\n");
}

function ensureSourceExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`missing source directory: ${label}`);
  }
}

function shouldCopyBundleEntry(sourcePath) {
  const name = path.basename(sourcePath);
  if (name === ".DS_Store" || name === ".gitkeep") {
    return false;
  }
  if (name === "tmp" || name === "output" || name === "state") {
    const relativePath = path.relative(sourceSkillRoot, sourcePath);
    return relativePath.split(path.sep).length > 1;
  }
  return true;
}
