import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  allArtifactSpecs,
  resolveArtifact
} from "../skills/miku-text-bundle/lib/runtime-artifacts.mjs";

const root = process.cwd();
const skillDir = path.join(root, "skills", "miku-text-bundle");
const requiredFiles = [
  "README.md",
  "TODO.md",
  "LICENSE",
  ".gitignore",
  ".github/workflows/release-build.yml",
  "skills/miku-text-bundle/SKILL.md",
  "skills/miku-text-bundle/agents/openai.yaml",
  "skills/miku-text-bundle/lib/runtime-artifacts.mjs",
  "skills/miku-text-bundle/references/INDEX.md",
  "skills/miku-text-bundle/references/upstream.md",
  "skills/miku-text-bundle/references/workflow.md",
  "skills/miku-text-bundle/references/runtime/operations-map.md",
  "skills/miku-text-bundle/runtime/miku-text-bundle-0.5.3.mjs",
  "skills/miku-text-bundle/runtime/miku-text-bundle-sources-0.5.3.tgz",
  "skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.3.jar",
  "skills/miku-text-bundle/runtime/miku-text-bundle-java-sources-0.5.3.jar",
  "workplace/.gitkeep"
];

for (const file of requiredFiles) {
  await access(path.join(root, file));
}

for (const spec of allArtifactSpecs()) {
  await resolveArtifact(root, spec);
}

const skill = await readFile(path.join(skillDir, "SKILL.md"), "utf8");
if (!skill.startsWith("---\n")) {
  throw new Error("SKILL.md must start with YAML frontmatter.");
}

const frontmatterEnd = skill.indexOf("\n---\n", 4);
if (frontmatterEnd === -1) {
  throw new Error("SKILL.md frontmatter must end with ---.");
}

const frontmatter = skill.slice(4, frontmatterEnd);
for (const field of ["name: miku-text-bundle", "description:"]) {
  if (!frontmatter.includes(field)) {
    throw new Error(`SKILL.md frontmatter is missing ${field}`);
  }
}

if (skill.includes("TODO") || skill.includes("TBD")) {
  throw new Error("SKILL.md should not contain TODO/TBD placeholders.");
}

const docs = await readdir(path.join(root, "docs"));
const requiredDocPrefixes = [
  "miku-soft-00-",
  "miku-soft-10-",
  "miku-soft-20-",
  "miku-soft-30-",
  "miku-soft-40-",
  "miku-soft-50-"
];

for (const prefix of requiredDocPrefixes) {
  if (!docs.some((name) => name.startsWith(prefix) && name.endsWith(".md"))) {
    throw new Error(`Missing copied miku-soft design document: ${prefix}*.md`);
  }
}

console.log("miku-text-bundle skill skeleton validated.");
