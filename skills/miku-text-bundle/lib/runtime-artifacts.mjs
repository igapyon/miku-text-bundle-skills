import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, realpath } from "node:fs/promises";
import path from "node:path";

export const runtimeArtifacts = {
  node: {
    backend: "node",
    version: "0.8.0",
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-0.8.0.mjs",
    sha256: "67dd613eb319d6a3bc7844a443fbee31dfaec03d695fbea8e58eadeb1b3fa9f6",
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
    version: "0.8.0",
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-java-0.8.0.jar",
    sha256: "bb2b7f248987f4bedfdb7abe36f41cbbc0ae013aae174bef37c51ae8d1e5e5db",
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
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-sources-0.8.0.tgz",
    sha256: "af7a039c40c6ab5d2b917461a3fcf97ec3b7d2103a21d40e2837c4296bfb3b8c"
  },
  java: {
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-java-sources-0.8.0.jar",
    sha256: "c7886d8e98c514278906d791ee6a586a4a2976f25cfb89d073cdf79d8c8762d9"
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
