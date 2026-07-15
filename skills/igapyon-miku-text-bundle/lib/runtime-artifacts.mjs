import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, realpath } from "node:fs/promises";
import path from "node:path";

export const runtimeArtifacts = {
  node: {
    backend: "node",
    version: "1.4.0",
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.4.0.mjs",
    sha256: "e5f5f3bef6c6b974e0a5d14f2e939437529e09fb787218938ccdb132824e0c18",
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
    version: "1.4.0",
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.4.0.jar",
    sha256: "601a357f35817286120aaf192e6355eb6372b19410c2d85743aad69219034e19",
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
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-sources-1.4.0.tgz",
    sha256: "f043f39ca172f581f7f202f4896d182d3ace1ee3227beae85adcf19e2c20ef59"
  },
  java: {
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-sources-1.4.0.jar",
    sha256: "2b900557970bb5d234a995efea9ac5e6ccca646c2740ce9a869cb4d9c1dc2628"
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
