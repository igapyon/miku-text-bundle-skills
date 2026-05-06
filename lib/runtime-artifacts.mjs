import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";

export const runtimeArtifacts = {
  node: {
    backend: "node",
    version: "0.5.0.3",
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-0.5.0.3.mjs",
    sha256: "fa52a17cdb992a24ab9fbc08df833aa3519c3d2d88297671668cf07dc21bd73c",
    command: (artifactPath, inputDir, outputDir, options = []) => [
      "node",
      artifactPath,
      inputDir,
      outputDir,
      ...options
    ]
  },
  java: {
    backend: "java",
    version: "0.5.0.2",
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-java-0.5.0.2.jar",
    sha256: "af2f5677aa82b706e0da99c2f1260cdbc9fd497d985a083621cd132906d85e5b",
    command: (artifactPath, inputDir, outputDir, options = []) => [
      "java",
      "-jar",
      artifactPath,
      inputDir,
      outputDir,
      ...options
    ]
  }
};

export const defaultRuntimeBackend = "java";
export const fallbackRuntimeOrder = ["java", "node"];

export const sourceArtifacts = {
  node: {
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-sources-0.5.0.3.tgz",
    sha256: "ae4ee83ed80c57316eb97f3d8a78ef01916d7005bff2e970d105b742e9450d3b"
  },
  java: {
    file: "skills/miku-text-bundle/runtime/miku-text-bundle-java-sources-0.5.0.2.jar",
    sha256: "df8b7a510a25292d7ec642c849f19944d4a23c5e0e4e94be1025568a100a4e31"
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
  return artifactPath;
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
