import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, realpath } from "node:fs/promises";
import path from "node:path";

export const runtimeArtifacts = {
  node: {
    backend: "node",
    version: "1.0.0",
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-1.0.0.mjs",
    sha256: "32b68c9a5b9b8f04949ab4ad57c5b4b6787ac3e2287ce82301fbc976a9ca01ba",
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
    version: "1.0.0",
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-1.0.0.jar",
    sha256: "b64f2df035d731f79800998b382367da679a918d91048f35ef633a0c66c74769",
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
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-sources-1.0.0.tgz",
    sha256: "73bc2c70ea69b73845aecdce829f6de119dc3e0fd861c4f022237852e9abbd84"
  },
  java: {
    file: "skills/igapyon-miku-text-bundle/runtime/miku-text-bundle-java-sources-1.0.0.jar",
    sha256: "e986a417c7a3ad35707cf9b7338eff3dc23aca3f5f6bc53947674f73e571c390"
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
