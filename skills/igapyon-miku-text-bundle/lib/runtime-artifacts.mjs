import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, realpath } from "node:fs/promises";
import path from "node:path";

export const runtimeArtifacts = {
  node: {
    backend: "node",
    version: "1.5.1",
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.5.1.mjs",
    sha256: "2bb9bebc9344253375141736ca435309724da8f2a26caf7bf0120abcc22bd45c",
    command: (artifactPath, inputDir, outputDir, options = []) => [
      "node",
      artifactPath,
      "--input",
      inputDir,
      "--output",
      outputDir,
      ...options
    ]
  },
  java: {
    backend: "java",
    version: "1.5.0",
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.5.0.jar",
    sha256: "77315a89f0d9f474d67aeddc964b7cca350af7557068c3f905c533d8532d410a",
    command: (artifactPath, inputDir, outputDir, options = []) => [
      "java",
      "-jar",
      artifactPath,
      "--input",
      inputDir,
      "--output",
      outputDir,
      ...options
    ]
  }
};

export const defaultRuntimeBackend = "java";
export const fallbackRuntimeOrder = ["java", "node"];

export const sourceArtifacts = {
  node: {
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-sources-1.5.1.tgz",
    sha256: "8a64adbef4afeb58321a9b702225cead552f3617294ad2d3e515650116b44fab"
  },
  java: {
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-sources-1.5.0.jar",
    sha256: "85513027da929967cdbd79225acb3365b4524b3629195033cadd7e89f5810199"
  }
};

export function allArtifactSpecs() {
  return [
    ...Object.values(runtimeArtifacts),
    ...Object.values(sourceArtifacts)
  ];
}

export async function sha256(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", resolve);
  });
  return hash.digest("hex");
}

export async function resolveArtifact(root, spec) {
  const artifactPath = path.join(root, spec.file);
  await access(artifactPath);
  const actual = await sha256(artifactPath);
  if (actual !== spec.sha256) {
    throw new Error(`Unexpected sha256 for ${spec.file}: ${actual}`);
  }
  return realpath(artifactPath);
}

export async function resolveRuntime(root, backend) {
  const spec = runtimeArtifacts[backend];
  if (!spec) {
    throw new Error(`Unknown runtime backend: ${backend}`);
  }
  return {
    ...spec,
    path: await resolveArtifact(root, spec)
  };
}

export async function planRuntimeSelection({
  root,
  requestedBackend,
  unavailableBackends = []
} = {}) {
  if (!root) {
    throw new Error("root is required");
  }

  const unavailable = new Set(unavailableBackends);
  const runtimeOrder = requestedBackend
    ? [requestedBackend]
    : fallbackRuntimeOrder;
  const attemptedBackends = [];
  const errors = [];

  for (const backend of runtimeOrder) {
    attemptedBackends.push(backend);

    if (!runtimeArtifacts[backend]) {
      errors.push({ backend, reason: "unknown_runtime_backend" });
      continue;
    }
    if (unavailable.has(backend)) {
      errors.push({ backend, reason: "runtime_unavailable" });
      continue;
    }

    try {
      const runtime = await resolveRuntime(root, backend);
      const primaryBackend = runtimeOrder[0];
      return {
        mode: "execute",
        selectedBackend: backend,
        attemptedBackends,
        runtime,
        fallback: backend === primaryBackend
          ? null
          : {
              from: primaryBackend,
              to: backend,
              reason: reasonForBackend(primaryBackend, errors)
            },
        error: null
      };
    } catch (error) {
      errors.push({
        backend,
        reason: "runtime_unusable",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    mode: "error",
    selectedBackend: null,
    attemptedBackends,
    runtime: null,
    fallback: null,
    error: {
      reason: "no_cli_runtime_available",
      details: errors
    }
  };
}

function reasonForBackend(backend, errors) {
  return errors.find((error) => error.backend === backend)?.reason ?? "runtime_unsuitable";
}
