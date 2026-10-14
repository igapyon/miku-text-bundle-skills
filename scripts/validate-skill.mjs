import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  allArtifactSpecs,
  resolveArtifact
} from "../skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs";

const root = process.cwd();
const skillDir = path.join(root, "skills", "igapyon-miku-text-bundle");
const requiredFiles = [
  "README.md",
  "TODO.md",
  "LICENSE",
  ".gitignore",
  ".github/workflows/release-build.yml",
  "docs/miku-soft-reference.md",
  "skills/igapyon-miku-text-bundle/SKILL.md",
  "skills/igapyon-miku-text-bundle/agents/openai.yaml",
  "skills/igapyon-miku-text-bundle/lib/runtime-artifacts.mjs",
  "skills/igapyon-miku-text-bundle/references/INDEX.md",
  "skills/igapyon-miku-text-bundle/references/upstream.md",
  "skills/igapyon-miku-text-bundle/references/workflow.md",
  "skills/igapyon-miku-text-bundle/references/runtime/operations-map.md",
  "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.6.0.mjs",
  "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-sources-1.6.0.tgz",
  "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.6.0.jar",
  "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-sources-1.6.0.jar",
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
for (const field of ["name: igapyon-miku-text-bundle", "description:"]) {
  if (!frontmatter.includes(field)) {
    throw new Error(`SKILL.md frontmatter is missing ${field}`);
  }
}

if (skill.includes("TODO") || skill.includes("TBD")) {
  throw new Error("SKILL.md should not contain TODO/TBD placeholders.");
}

const docs = await readdir(path.join(root, "docs"));
for (const name of docs) {
  if (/^miku-soft-\d+-.*\.md$/.test(name)) {
    throw new Error(`Shared miku-soft design documents should not be copied into docs/: ${name}`);
  }
}

console.log("igapyon-miku-text-bundle skill skeleton validated.");
