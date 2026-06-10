#!/usr/bin/env node
import { mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

// markdown.js
const EXTENSION_LANGUAGES = {
    ts: "ts",
    tsx: "tsx",
    js: "js",
    jsx: "jsx",
    mjs: "js",
    cjs: "js",
    java: "java",
    cs: "csharp",
    md: "md",
    json: "json",
};
function fenceFor(content) {
    const matches = content.match(/~{3,}/g) ?? [];
    const longest = matches.reduce((max, item) => Math.max(max, item.length), 2);
    return "~".repeat(longest + 1);
}
function languageFor(extension) {
    return EXTENSION_LANGUAGES[extension] ?? "";
}
function markdown(lines) {
    return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}
function frontMatter(role, metadata = {}, extra = []) {
    return [
        "---",
        `tool: ${metadata.toolName ?? "miku-text-bundle"}`,
        `version: ${metadata.toolVersion ?? "unknown"}`,
        `role: ${role}`,
        ...extra,
        "---",
        "",
    ];
}
function table(headers, alignments, rows) {
    return [
        `| ${headers.join(" | ")} |`,
        `| ${alignments.join(" | ")} |`,
        ...rows.map((row) => `| ${row.join(" | ")} |`),
        "",
    ];
}
function code(value) {
    return `\`${value}\``;
}
function warningList(warnings) {
    if (warnings.length === 0) {
        return ["- None", ""];
    }
    return warnings.map((warning) => `- ${warning}`).concat("");
}
function markerTable(markers) {
    if (markers.length === 0) {
        return "- None\n";
    }
    return table(["File", "Line", "Kind", "Text"], ["---", "---:", "---", "---"], markers.map((marker) => [code(marker.relativePath), String(marker.line), marker.kind, escapeTable(marker.text)])).join("\n");
}
function escapeTable(value) {
    return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
function buildChunkMarkdown(chunk) {
    const lines = [
        `### ${chunk.relativePath}`,
        "",
        `- Characters: ${chunk.content.length}`,
        `- Source characters: ${chunk.originalCharCount}`,
        `- Source lines: ${chunk.originalLineCount}`,
    ];
    if (chunk.splitReason) {
        lines.push(`- Warning: ${chunk.splitReason}`);
        lines.push(`- Split: ${chunk.chunkIndex} / ${chunk.chunkCount}`);
    }
    lines.push("");
    if (chunk.splitReason) {
        lines.push(`This file exceeded the size limit and was split. Source file: \`${chunk.relativePath}\`. Split: ${chunk.chunkIndex} / ${chunk.chunkCount}.`);
        lines.push("");
    }
    const fence = fenceFor(chunk.content);
    const language = languageFor(chunk.extension);
    lines.push(`${fence}${language}`);
    lines.push(chunk.content);
    lines.push(fence);
    lines.push("");
    return lines;
}
function partsTable(parts) {
    return table(["Part", "Chunks", "Approx chars", "Files"], ["---", "---:", "---:", "---"], parts.map((part) => [
        code(part.fileName),
        String(part.chunks.length),
        String(part.charCount),
        part.chunks.map((chunk) => code(chunk.relativePath)).join("<br>"),
    ]));
}
function skippedFilesTable(skippedFiles) {
    if (skippedFiles.length === 0) {
        return ["- None", ""];
    }
    return table(["File", "Reason"], ["---", "---"], skippedFiles.map((file) => [code(file.relativePath), escapeTable(file.reason)]));
}
function agentSkillPaths(collectedFiles) {
    return collectedFiles
        .map((file) => file.relativePath)
        .filter((relativePath) => relativePath === "SKILL.md" || /^skills\/[^/]+\/SKILL\.md$/.test(relativePath));
}
function agentSkillHandoffSection(skillPaths) {
    if (skillPaths.length === 0) {
        return [];
    }
    return [
        "## Agent Skill Handoff",
        "",
        "This Text Bundle includes Agent Skill definitions.",
        "",
        "Read the following `SKILL.md` files as the primary Agent Skill instructions and keep them available for reference in this conversation.",
        "",
        ...skillPaths.map((skillPath) => `- ${code(skillPath)}`),
        "",
        "After receiving this `999-index` file, the Text Bundle loading is complete. If the user asks to use this Agent Skill or the target product, prioritize the relevant `SKILL.md` activation rules, operating rules, workflow, and references, and work from the related files in this bundle.",
        "",
        "If higher-priority system, developer, or user instructions apply, follow those instructions first.",
        "",
    ];
}
function buildPartMarkdown(part, metadata = {}) {
    const lines = [
        ...frontMatter("part", metadata, [`part: ${part.partNumber}`]),
        `# Text Bundle Part ${String(part.partNumber).padStart(3, "0")}`,
        "",
        `- Part file: \`${part.fileName}\``,
        `- Files/chunks: ${part.chunks.length}`,
        `- Approx chars: ${part.charCount}`,
        "",
    ];
    for (const chunk of part.chunks) {
        lines.push(...buildChunkMarkdown(chunk));
    }
    return markdown(lines);
}
function buildIndexMarkdown(params) {
    const { inputDirectory, outputDirectory, parts, collectedFiles, skippedFiles, markers, warnings, toolName, toolVersion } = params;
    const skillPaths = agentSkillPaths(collectedFiles);
    const lines = [
        ...frontMatter("index", { toolName, toolVersion }, ["terminal: true"]),
        "# Text Bundle Index",
        "",
        "## Summary",
        "",
        `- Input directory: \`${inputDirectory}\``,
        `- Output directory: \`${outputDirectory}\``,
        `- Collected files: ${collectedFiles.length}`,
        `- Skipped files: ${skippedFiles.length}`,
        `- Parts: ${parts.length}`,
        "",
        ...agentSkillHandoffSection(skillPaths),
        "## Parts",
        "",
        ...partsTable(parts),
        "## Skipped Files",
        "",
        ...skippedFilesTable(skippedFiles),
        "## Warnings",
        "",
        ...warningList(warnings),
        "## Markers",
        "",
        markerTable(markers),
    ];
    return markdown(lines);
}
function normalizePromptMarkdownParams(params) {
    if (Array.isArray(params)) {
        return {
            promptFileName: "text-bundle-000-prompt.md",
            partFileNames: params,
            indexFileName: "text-bundle-999-index.md",
        };
    }
    return params;
}
function buildPromptMarkdown(params) {
    const { promptFileName, partFileNames, indexFileName, toolName, toolVersion } = normalizePromptMarkdownParams(params);
    const lines = [
        ...frontMatter("prompt", { toolName, toolVersion }),
        "# Text Bundle Prompt",
        "",
        "This is the reading instruction for a Text Bundle that packages a set of files for handoff to generative AI or similar tools.",
        "",
        "The Markdown bundle will be sent in multiple messages in the order listed below.",
        "",
        "After each message, do not analyze or summarize the content yet. Reply only with `Received`.",
        "",
        `Do not start the final response until you receive \`${indexFileName}\`.`,
        "",
        "## Reading Order",
        "",
        `1. \`${promptFileName}\``,
        ...partFileNames.map((fileName, index) => `${index + 2}. \`${fileName}\``),
        `${partFileNames.length + 2}. \`${indexFileName}\``,
        "",
        "## Response File",
        "",
        `If you save the final response after \`${indexFileName}\`, \`text-bundle-response.md\` is the recommended filename.`,
        "",
        "## Output Format",
        "",
        "Output the final response as Markdown text.",
        "",
        "Wrap the entire final Markdown response in a single outer fence using `~~~~`. Use tildes for the outer fence because the Markdown response may contain backtick code fences.",
        "",
    ];
    return lines.join("\n");
}

// match.js
function escapeRegex(value) {
    return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}
function globToRegex(pattern) {
    const normalized = normalizePattern(pattern);
    let source = "";
    for (let i = 0; i < normalized.length; i += 1) {
        const char = normalized[i];
        const next = normalized[i + 1];
        const afterNext = normalized[i + 2];
        if (char === "*" && next === "*" && afterNext === "/") {
            source += "(?:.*/)?";
            i += 2;
            continue;
        }
        if (char === "*" && next === "*") {
            source += ".*";
            i += 1;
            continue;
        }
        if (char === "*") {
            source += "[^/]*";
            continue;
        }
        source += escapeRegex(char);
    }
    return new RegExp(`^${source}$`);
}
function matchesAnyPattern(relativePath, patterns) {
    const normalizedPath = normalizePattern(relativePath);
    return patterns.some((pattern) => {
        const normalizedPattern = normalizePattern(pattern);
        if (!normalizedPattern.includes("*")) {
            return normalizedPath === normalizedPattern || normalizedPath.startsWith(`${normalizedPattern.replace(/\/$/, "")}/`);
        }
        return globToRegex(normalizedPattern).test(normalizedPath);
    });
}
function parseGitignore(content) {
    return content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#") && !line.startsWith("!"));
}
function matchesBasenamePattern(normalizedPath, cleanPattern, rootAnchored, directoryOnly) {
    const segments = normalizedPath.split("/");
    if (directoryOnly) {
        if (rootAnchored) {
            return segments[0] === cleanPattern;
        }
        return segments.slice(0, -1).includes(cleanPattern);
    }
    if (cleanPattern.includes("*")) {
        const regex = globToRegex(cleanPattern);
        return segments.some((segment) => regex.test(segment));
    }
    if (rootAnchored) {
        return normalizedPath === cleanPattern;
    }
    return segments.includes(cleanPattern) || normalizedPath.endsWith(`/${cleanPattern}`);
}
function matchesPathPattern(normalizedPath, cleanPattern, rootAnchored, directoryOnly) {
    if (directoryOnly) {
        if (rootAnchored) {
            return normalizedPath === cleanPattern || normalizedPath.startsWith(`${cleanPattern}/`);
        }
        return normalizedPath === cleanPattern || normalizedPath.includes(`/${cleanPattern}/`) || normalizedPath.startsWith(`${cleanPattern}/`);
    }
    if (cleanPattern.includes("*")) {
        const regex = globToRegex(cleanPattern);
        if (rootAnchored) {
            return regex.test(normalizedPath);
        }
        return regex.test(normalizedPath) || globToRegex(`**/${cleanPattern}`).test(normalizedPath);
    }
    if (rootAnchored) {
        return normalizedPath === cleanPattern || normalizedPath.startsWith(`${cleanPattern}/`);
    }
    return normalizedPath === cleanPattern || normalizedPath.endsWith(`/${cleanPattern}`) || normalizedPath.startsWith(`${cleanPattern}/`);
}
function matchesGitignore(relativePath, patterns) {
    const normalizedPath = normalizePattern(relativePath);
    return patterns.some((pattern) => {
        const rootAnchored = pattern.trim().startsWith("/");
        const normalizedPattern = normalizePattern(pattern.replace(/^\//, ""));
        const directoryOnly = normalizedPattern.endsWith("/");
        const cleanPattern = normalizedPattern.replace(/\/$/, "");
        if (cleanPattern.length === 0) {
            return false;
        }
        if (!cleanPattern.includes("/")) {
            return matchesBasenamePattern(normalizedPath, cleanPattern, rootAnchored, directoryOnly);
        }
        return matchesPathPattern(normalizedPath, cleanPattern, rootAnchored, directoryOnly);
    });
}

// path-utils.js
function toPosixPath(pathValue) {
    return pathValue.split(sep).join("/");
}
function getExtension(pathValue) {
    return extname(pathValue).toLowerCase().replace(/^\./, "");
}
function normalizePattern(pattern) {
    return toPosixPath(pattern.trim()).replace(/^\.\//, "");
}
function compareUtf16CodeUnits(left, right) {
    if (left < right) {
        return -1;
    }
    if (left > right) {
        return 1;
    }
    return 0;
}

// cli.js
const CLI_DEFAULT_MAX_CHARS = 120000;
const CLI_DEFAULT_MAX_INPUT_FILE_BYTES = 1_000_000;
const CLI_DEFAULT_FILENAME_PREFIX = "text-bundle";
const CLI_VERSION = "1.0.1";
const SUPPORTED_ENCODINGS = new Set(["utf-8", "shift_jis"]);
const DEFAULT_EXCLUDE_EXTENSIONS = [
    ".7z",
    ".aac",
    ".avi",
    ".bmp",
    ".bz2",
    ".class",
    ".db",
    ".dll",
    ".doc",
    ".docx",
    ".dylib",
    ".exe",
    ".flac",
    ".gif",
    ".gz",
    ".ico",
    ".jar",
    ".jpeg",
    ".jpg",
    ".m4a",
    ".mkv",
    ".mov",
    ".mp3",
    ".mp4",
    ".ogg",
    ".otf",
    ".parquet",
    ".pdf",
    ".png",
    ".ppt",
    ".pptx",
    ".rar",
    ".so",
    ".sqlite",
    ".svgz",
    ".tar",
    ".tgz",
    ".tiff",
    ".ttf",
    ".war",
    ".wav",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
    ".xls",
    ".xlsx",
    ".xz",
    ".zip",
];
const DEFAULT_EXCLUDE_DIRECTORIES = [
    ".git",
    ".codex",
    ".vscode",
    ".idea",
    "node_modules",
    "dist",
    "build",
    "target",
    "coverage",
    "workplace",
    "tmp",
    "temp",
];
class HelpRequestedError extends Error {
    constructor() {
        super("Help requested.");
        this.name = "HelpRequestedError";
    }
}
class VersionRequestedError extends Error {
    constructor() {
        super("Version requested.");
        this.name = "VersionRequestedError";
    }
}
function readRequiredOptionValue(argv, index, optionName) {
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
        throw new Error(`Please specify a value for ${optionName}.`);
    }
    return value;
}
function parsePatternList(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}
function parsePositiveInteger(value, optionName) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new Error(`${optionName} must be a positive integer.`);
    }
    return parsed;
}
function parseFilenamePrefix(value) {
    const prefix = value.trim();
    if (prefix.length === 0) {
        throw new Error("--filename-prefix must not be empty.");
    }
    if (!/^[A-Za-z0-9._-]+$/.test(prefix)) {
        throw new Error("--filename-prefix must contain only ASCII letters, digits, dots, underscores, and hyphens.");
    }
    return prefix;
}
function parseSupportedEncoding(value, optionName) {
    if (SUPPORTED_ENCODINGS.has(value)) {
        return value;
    }
    throw new Error(`${optionName} must be one of: utf-8, shift_jis.`);
}
function parseExtensionList(value, optionName) {
    return parsePatternList(value).map((item) => {
        const extension = item.toLowerCase();
        if (extension.length <= 1 || !extension.startsWith(".") || extension.includes("/") || extension.includes("\\")) {
            throw new Error(`${optionName} values must be extensions with a leading dot.`);
        }
        return extension;
    });
}
function parseDirectoryList(value, optionName) {
    return parsePatternList(value).map((item) => {
        const directory = normalizePattern(item).replace(/\/+$/, "");
        if (directory.length === 0 || directory === ".") {
            throw new Error(`${optionName} values must be relative directory names or paths.`);
        }
        return directory;
    });
}
function parseEncodingExtensions(value) {
    const extensions = {};
    for (const item of parsePatternList(value)) {
        const separatorIndex = item.indexOf("=");
        if (separatorIndex <= 0 || separatorIndex === item.length - 1) {
            throw new Error("--encoding-extension entries must use .ext=encoding format.");
        }
        const extension = item.slice(0, separatorIndex).trim();
        const encoding = item.slice(separatorIndex + 1).trim();
        if (!extension.startsWith(".") || extension.includes("/") || extension.includes("\\")) {
            throw new Error("--encoding-extension keys must be exact extensions with a leading dot.");
        }
        extensions[extension] = parseSupportedEncoding(encoding, "--encoding-extension");
    }
    return extensions;
}
function createParseState() {
    return {
        filenamePrefix: CLI_DEFAULT_FILENAME_PREFIX,
        maxChars: CLI_DEFAULT_MAX_CHARS,
        maxInputFileBytes: CLI_DEFAULT_MAX_INPUT_FILE_BYTES,
        encoding: {
            default: "utf-8",
            extensions: {},
        },
        excludeExtensions: new Set(DEFAULT_EXCLUDE_EXTENSIONS),
        excludeDirectories: new Set(DEFAULT_EXCLUDE_DIRECTORIES),
        verbose: false,
    };
}
function consumeOption(argv, index, state) {
    const arg = argv[index];
    if (arg === "--help") {
        throw new HelpRequestedError();
    }
    if (arg === "--version") {
        throw new VersionRequestedError();
    }
    if (arg === "--input") {
        state.inputDirectory = readRequiredOptionValue(argv, index, "--input");
        return index + 1;
    }
    if (arg === "--output") {
        state.outputDirectory = readRequiredOptionValue(argv, index, "--output");
        return index + 1;
    }
    if (arg === "--filename-prefix") {
        state.filenamePrefix = parseFilenamePrefix(readRequiredOptionValue(argv, index, "--filename-prefix"));
        return index + 1;
    }
    if (arg === "--max-chars") {
        state.maxChars = parsePositiveInteger(readRequiredOptionValue(argv, index, "--max-chars"), "--max-chars");
        return index + 1;
    }
    if (arg === "--max-input-file-bytes") {
        state.maxInputFileBytes = parsePositiveInteger(readRequiredOptionValue(argv, index, "--max-input-file-bytes"), "--max-input-file-bytes");
        return index + 1;
    }
    if (arg === "--encoding") {
        state.encoding.default = parseSupportedEncoding(readRequiredOptionValue(argv, index, "--encoding"), "--encoding");
        return index + 1;
    }
    if (arg === "--encoding-extension") {
        state.encoding.extensions = {
            ...state.encoding.extensions,
            ...parseEncodingExtensions(readRequiredOptionValue(argv, index, "--encoding-extension")),
        };
        return index + 1;
    }
    if (arg === "--add-exclude-extension") {
        for (const extension of parseExtensionList(readRequiredOptionValue(argv, index, "--add-exclude-extension"), "--add-exclude-extension")) {
            state.excludeExtensions.add(extension);
        }
        return index + 1;
    }
    if (arg === "--remove-exclude-extension") {
        for (const extension of parseExtensionList(readRequiredOptionValue(argv, index, "--remove-exclude-extension"), "--remove-exclude-extension")) {
            state.excludeExtensions.delete(extension);
        }
        return index + 1;
    }
    if (arg === "--add-exclude-directory") {
        for (const directory of parseDirectoryList(readRequiredOptionValue(argv, index, "--add-exclude-directory"), "--add-exclude-directory")) {
            state.excludeDirectories.add(directory);
        }
        return index + 1;
    }
    if (arg === "--remove-exclude-directory") {
        for (const directory of parseDirectoryList(readRequiredOptionValue(argv, index, "--remove-exclude-directory"), "--remove-exclude-directory")) {
            state.excludeDirectories.delete(directory);
        }
        return index + 1;
    }
    if (arg === "--verbose") {
        state.verbose = true;
        return index;
    }
    if (arg.startsWith("-")) {
        throw new Error(`Unknown argument: ${arg}`);
    }
    throw new Error(`Positional arguments are not supported. Use --input and --output: ${arg}`);
}
function validateRequiredDirectories(state) {
    if (!state.inputDirectory) {
        throw new Error("Please specify --input.");
    }
    if (!state.outputDirectory) {
        throw new Error("Please specify --output.");
    }
}
function parseArgs(argv) {
    const state = createParseState();
    for (let i = 0; i < argv.length; i += 1) {
        i = consumeOption(argv, i, state);
    }
    validateRequiredDirectories(state);
    const inputDirectory = state.inputDirectory;
    const outputDirectory = state.outputDirectory;
    if (!inputDirectory || !outputDirectory) {
        throw new Error("Please specify --input and --output.");
    }
    return {
        inputDirectory,
        outputDirectory,
        filenamePrefix: state.filenamePrefix,
        maxChars: state.maxChars,
        maxInputFileBytes: state.maxInputFileBytes,
        encoding: state.encoding,
        excludeExtensions: [...state.excludeExtensions].sort(compareUtf16CodeUnits),
        excludeDirectories: [...state.excludeDirectories].sort(compareUtf16CodeUnits),
        verbose: state.verbose,
    };
}
function printHelp() {
    console.log(`Usage:
  miku-text-bundle --input <dir> --output <dir> [options]
  miku-text-bundle --help
  miku-text-bundle --version

Description:
  Scan local text-like files under --input and generate split Markdown bundle
  files under --output for generative AI handoff. No network access is used.

Default behavior:
  Required: --input <dir>, --output <dir>
  Defaults: --filename-prefix text-bundle, --max-chars 120000,
  --max-input-file-bytes 1000000, --encoding utf-8.
  Input paths are ordered by POSIX relative path using UTF-16 code units.

Inputs:
  Reads regular files under --input. Skips known binary extensions, default
  excluded directories such as .git, node_modules, dist, coverage, target,
  workplace, and files ignored by the input root .gitignore.

Generated artifacts:
  <prefix>-000-prompt.md
  <prefix>-001.md ... <prefix>-998.md
  <prefix>-999-index.md
  These files are generated artifacts and may be regenerated.
  For Web UI, pasting <prefix>-000-prompt.md as the first message body is recommended, not required.

Output and overwrite behavior:
  Creates --output when missing. Existing generated files with the same names
  are overwritten. Terminal stdout is progress/completion text, not a stable
  machine-readable API. The Markdown files are the stable handoff artifacts.

Diagnostics and exit codes:
  Skipped readable-candidate files and split warnings are recorded in
  <prefix>-999-index.md. Invalid usage or processing errors are printed to
  stderr. Exit code 0 means success/help/version; exit code 1 means failure.

Options:
  --filename-prefix <prefix>       File basename prefix. Allowed: A-Z a-z 0-9 . _ -
  --max-chars <number>             Max approximate characters per part.
  --max-input-file-bytes <number>  Max bytes read from one input file.
  --encoding utf-8|shift_jis       Default input file encoding.
  --encoding-extension ".java=shift_jis"
  --add-exclude-extension ".ext"
  --remove-exclude-extension ".ext"
  --add-exclude-directory "dir"
  --remove-exclude-directory "dir"
  --verbose                        Print ignored-file count details.

Example:
  miku-text-bundle --input . --output out --filename-prefix my-repo-text-bundle
`);
}
function printVersion() {
    console.log(CLI_VERSION);
}

// discovery.js
function relativeDiscoveryPath(inputPath, filePath) {
    return toPosixPath(relative(inputPath, filePath));
}
function createIgnoreStats() {
    return {
        directories: 0,
        files: 0,
        byDirectory: 0,
        byExtension: 0,
        byGitignore: 0,
        byOutputDirectory: 0,
    };
}
function addIgnoredFiles(ignored, count, reason) {
    ignored.files += count;
    ignored[reason] += count;
}
function getEffectiveExcludeExtensions(options) {
    return new Set((options.excludeExtensions ?? DEFAULT_EXCLUDE_EXTENSIONS).map((extension) => extension.toLowerCase()));
}
function getEffectiveExcludeDirectories(options) {
    return new Set(options.excludeDirectories ?? DEFAULT_EXCLUDE_DIRECTORIES);
}
function isExcludedDirectory(relativePath, excludeDirectories) {
    const normalizedPath = toPosixPath(relativePath).replace(/\/+$/, "");
    const segments = normalizedPath.split("/").filter((segment) => segment.length > 0);
    for (const excludedDirectory of excludeDirectories) {
        if (excludedDirectory.includes("/")) {
            if (normalizedPath === excludedDirectory || normalizedPath.startsWith(`${excludedDirectory}/`)) {
                return true;
            }
            continue;
        }
        if (segments.includes(excludedDirectory)) {
            return true;
        }
    }
    return false;
}
function hasExcludedExtension(filePath, excludeExtensions) {
    const extension = extname(filePath).toLowerCase();
    return extension.length > 0 && excludeExtensions.has(extension);
}
function isOutputPathInsideInput(inputPath, outputPath) {
    const outputRelativePath = relativeDiscoveryPath(inputPath, outputPath);
    return !outputRelativePath.startsWith("../") && outputRelativePath !== ".." && outputRelativePath !== "";
}
function isInsideOutputDirectory(inputPath, filePath, outputPath) {
    if (!isOutputPathInsideInput(inputPath, outputPath)) {
        return false;
    }
    const outputRelativePath = relativeDiscoveryPath(inputPath, outputPath);
    const fileRelativePath = relativeDiscoveryPath(inputPath, filePath);
    return fileRelativePath === outputRelativePath || fileRelativePath.startsWith(`${outputRelativePath}/`);
}
function countDirectoryTree(startPath) {
    let directories = 1;
    let files = 0;
    for (const entry of readdirSync(startPath, { withFileTypes: true })) {
        const fullPath = join(startPath, entry.name);
        if (entry.isDirectory()) {
            const childCounts = countDirectoryTree(fullPath);
            directories += childCounts.directories;
            files += childCounts.files;
            continue;
        }
        if (entry.isFile()) {
            files += 1;
        }
    }
    return { directories, files };
}
function ignoreDirectory(fullPath, ignored, reason) {
    const counts = countDirectoryTree(fullPath);
    ignored.directories += counts.directories;
    addIgnoredFiles(ignored, counts.files, reason);
}
function listFilesRecursively(rootPath, startPath, outputPath, excludeDirectories, ignored) {
    const files = [];
    const entries = readdirSync(startPath, { withFileTypes: true }).sort((a, b) => compareUtf16CodeUnits(a.name, b.name));
    for (const entry of entries) {
        const fullPath = join(startPath, entry.name);
        const relativePath = relativeDiscoveryPath(rootPath, fullPath);
        if (entry.isDirectory()) {
            if (isInsideOutputDirectory(rootPath, fullPath, outputPath)) {
                ignoreDirectory(fullPath, ignored, "byOutputDirectory");
                continue;
            }
            if (isExcludedDirectory(relativePath, excludeDirectories)) {
                ignoreDirectory(fullPath, ignored, "byDirectory");
                continue;
            }
            files.push(...listFilesRecursively(rootPath, fullPath, outputPath, excludeDirectories, ignored));
            continue;
        }
        if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}
function shouldCollectCandidate(inputPath, outputPath, filePath, gitignorePatterns, excludeExtensions, ignored) {
    const relativePath = relativeDiscoveryPath(inputPath, filePath);
    if (isInsideOutputDirectory(inputPath, filePath, outputPath)) {
        addIgnoredFiles(ignored, 1, "byOutputDirectory");
        return false;
    }
    if (hasExcludedExtension(filePath, excludeExtensions)) {
        addIgnoredFiles(ignored, 1, "byExtension");
        return false;
    }
    if (matchesGitignore(relativePath, gitignorePatterns)) {
        addIgnoredFiles(ignored, 1, "byGitignore");
        return false;
    }
    return true;
}
function discoverCandidateFiles(inputPath, outputPath, options, gitignorePatterns) {
    const excludeExtensions = getEffectiveExcludeExtensions(options);
    const excludeDirectories = getEffectiveExcludeDirectories(options);
    const ignored = createIgnoreStats();
    const candidates = listFilesRecursively(inputPath, inputPath, outputPath, excludeDirectories, ignored);
    return {
        files: candidates
            .filter((filePath) => shouldCollectCandidate(inputPath, outputPath, filePath, gitignorePatterns, excludeExtensions, ignored))
            .sort((a, b) => compareUtf16CodeUnits(relativeDiscoveryPath(inputPath, a), relativeDiscoveryPath(inputPath, b))),
        ignored,
    };
}

// bundler.js
const MAX_BUNDLE_PART_NUMBER = 998;
const DEFAULT_FILENAME_PREFIX = "text-bundle";
const DEFAULT_MAX_INPUT_FILE_BYTES = 1_000_000;
const DEFAULT_ENCODING_OPTIONS = {
    default: "utf-8",
    extensions: {},
};
function normalizeFilenamePrefix(value) {
    const prefix = value.trim();
    if (prefix.length === 0) {
        throw new Error("filenamePrefix must not be empty.");
    }
    if (!/^[A-Za-z0-9._-]+$/.test(prefix)) {
        throw new Error("filenamePrefix must contain only ASCII letters, digits, dots, underscores, and hyphens.");
    }
    return prefix;
}
function chooseOutputDirectory(outputDirectory) {
    return resolve(outputDirectory);
}
function relativeInputPath(inputPath, filePath) {
    return toPosixPath(relative(inputPath, filePath));
}
function displayPathFromCurrentDirectory(pathValue) {
    const relativePath = relative(process.cwd(), pathValue);
    return relativePath.length === 0 ? "." : toPosixPath(relativePath);
}
function readRootGitignore(inputPath) {
    const gitignorePath = join(inputPath, ".gitignore");
    if (!statSync(gitignorePath, { throwIfNoEntry: false })?.isFile()) {
        return [];
    }
    return parseGitignore(readFileSync(gitignorePath, "utf8"));
}
function selectEncoding(relativePath, options) {
    const extension = extname(relativePath);
    const encoding = options.encoding ?? DEFAULT_ENCODING_OPTIONS;
    return encoding.extensions[extension] ?? encoding.default;
}
function decodeText(buffer, encoding) {
    if (buffer.includes(0)) {
        return undefined;
    }
    try {
        return new TextDecoder(encoding, { fatal: true }).decode(buffer);
    }
    catch {
        return undefined;
    }
}
function formatEncoding(encoding) {
    return encoding === "utf-8" ? "UTF-8" : "Shift_JIS";
}
function extractMarkers(relativePath, content) {
    return content.split(/\r?\n/).flatMap((lineText, index) => {
        const match = lineText.match(/\b(TODO|FIXME|XXX)\b(?!\.)(.*)/);
        if (!match) {
            return [];
        }
        return [{
                relativePath,
                line: index + 1,
                kind: match[1],
                text: lineText.trim(),
            }];
    });
}
function skippedForOversizedFile(relativePath, maxInputFileBytes) {
    return {
        relativePath,
        reason: `File size exceeds the ${maxInputFileBytes} byte limit.`,
    };
}
function skippedForUnreadableFile(relativePath, encoding) {
    return {
        relativePath,
        reason: `Skipped because the file cannot be decoded as ${formatEncoding(encoding)} or was detected as binary.`,
    };
}
function createCollectedFile(filePath, relativePath, content) {
    return {
        absolutePath: filePath,
        relativePath,
        extension: getExtension(filePath),
        content,
        charCount: content.length,
        lineCount: content.length === 0 ? 0 : content.split(/\r?\n/).length,
        markers: extractMarkers(relativePath, content),
    };
}
function collectFiles(inputPath, outputPath, options, gitignorePatterns) {
    const files = [];
    const skipped = [];
    const maxInputFileBytes = options.maxInputFileBytes ?? DEFAULT_MAX_INPUT_FILE_BYTES;
    const discovered = discoverCandidateFiles(inputPath, outputPath, options, gitignorePatterns);
    for (const filePath of discovered.files) {
        const relativePath = relativeInputPath(inputPath, filePath);
        const fileStat = statSync(filePath);
        if (fileStat.size > maxInputFileBytes) {
            skipped.push(skippedForOversizedFile(relativePath, maxInputFileBytes));
            continue;
        }
        const buffer = readFileSync(filePath);
        const encoding = selectEncoding(relativePath, options);
        const content = decodeText(buffer, encoding);
        if (content === undefined) {
            skipped.push(skippedForUnreadableFile(relativePath, encoding));
            continue;
        }
        files.push(createCollectedFile(filePath, relativePath, content));
    }
    return { files, skipped, ignored: discovered.ignored };
}
function createSingleFileChunk(file) {
    return {
        relativePath: file.relativePath,
        extension: file.extension,
        content: file.content,
        originalCharCount: file.charCount,
        originalLineCount: file.lineCount,
        chunkIndex: 1,
        chunkCount: 1,
    };
}
function splitContentByMaxChars(content, maxChars) {
    const chunks = [];
    let current = "";
    for (const line of content.split(/(?<=\n)/)) {
        if (current.length > 0 && current.length + line.length > maxChars) {
            chunks.push(current);
            current = "";
        }
        if (line.length > maxChars) {
            if (current.length > 0) {
                chunks.push(current);
                current = "";
            }
            for (let i = 0; i < line.length; i += maxChars) {
                chunks.push(line.slice(i, i + maxChars));
            }
            continue;
        }
        current += line;
    }
    if (current.length > 0) {
        chunks.push(current);
    }
    return chunks;
}
function createSplitFileChunks(file, chunkContents) {
    const chunkCount = chunkContents.length;
    return chunkContents.map((content, index) => ({
        relativePath: file.relativePath,
        extension: file.extension,
        content,
        originalCharCount: file.charCount,
        originalLineCount: file.lineCount,
        chunkIndex: index + 1,
        chunkCount,
        splitReason: "This file exceeded the size limit and was split.",
    }));
}
function splitOversizedFile(file, maxChars) {
    if (file.content.length <= maxChars) {
        return [createSingleFileChunk(file)];
    }
    return createSplitFileChunks(file, splitContentByMaxChars(file.content, maxChars));
}
function bundlePromptFileName(filenamePrefix) {
    return `${filenamePrefix}-000-prompt.md`;
}
function bundlePartFileName(filenamePrefix, partNumber) {
    return `${filenamePrefix}-${String(partNumber).padStart(3, "0")}.md`;
}
function bundleIndexFileName(filenamePrefix) {
    return `${filenamePrefix}-999-index.md`;
}
function createBundlePart(filenamePrefix, partNumber, chunks, charCount) {
    if (partNumber > MAX_BUNDLE_PART_NUMBER) {
        throw new Error(`Part count exceeds ${MAX_BUNDLE_PART_NUMBER}; ${bundleIndexFileName(filenamePrefix)} is reserved for the final index.`);
    }
    return {
        fileName: bundlePartFileName(filenamePrefix, partNumber),
        partNumber,
        chunks,
        charCount,
    };
}
function shouldStartNewPart(currentChunks, currentChars, nextChunk, maxChars) {
    return currentChunks.length > 0 && currentChars + nextChunk.content.length > maxChars;
}
function warningForSplitFile(file, chunkCount) {
    return `\`${file.relativePath}\` exceeded --max-chars and was split into ${chunkCount} chunks.`;
}
function buildChunks(files, maxChars) {
    const warnings = [];
    const chunks = files.flatMap((file) => {
        const fileChunks = splitOversizedFile(file, maxChars);
        if (fileChunks.length > 1) {
            warnings.push(warningForSplitFile(file, fileChunks.length));
        }
        return fileChunks;
    });
    return { chunks, warnings };
}
function buildParts(files, maxChars, filenamePrefix) {
    const { chunks, warnings } = buildChunks(files, maxChars);
    const parts = [];
    let currentChunks = [];
    let currentChars = 0;
    const pushPart = () => {
        if (currentChunks.length === 0) {
            return;
        }
        parts.push(createBundlePart(filenamePrefix, parts.length + 1, currentChunks, currentChars));
        currentChunks = [];
        currentChars = 0;
    };
    for (const chunk of chunks) {
        if (shouldStartNewPart(currentChunks, currentChars, chunk, maxChars)) {
            pushPart();
        }
        currentChunks.push(chunk);
        currentChars += chunk.content.length;
    }
    pushPart();
    return { parts, warnings };
}
function writeBundleMarkdownFiles(params) {
    const { outputDirectory, filenamePrefix, inputDirectory, parts, collectedFiles, skippedFiles, markers, warnings } = params;
    const indexFileName = bundleIndexFileName(filenamePrefix);
    const promptFileName = bundlePromptFileName(filenamePrefix);
    const indexPath = join(outputDirectory, indexFileName);
    const promptPath = join(outputDirectory, promptFileName);
    const partPaths = parts.map((part) => join(outputDirectory, part.fileName));
    for (const part of parts) {
        writeFileSync(join(outputDirectory, part.fileName), buildPartMarkdown(part, {
            toolName: "miku-text-bundle",
            toolVersion: CLI_VERSION,
        }), "utf8");
    }
    writeFileSync(indexPath, buildIndexMarkdown({
        inputDirectory: displayPathFromCurrentDirectory(inputDirectory),
        outputDirectory: displayPathFromCurrentDirectory(outputDirectory),
        parts,
        collectedFiles,
        skippedFiles,
        markers,
        warnings,
        toolName: "miku-text-bundle",
        toolVersion: CLI_VERSION,
    }), "utf8");
    writeFileSync(promptPath, buildPromptMarkdown({
        promptFileName,
        partFileNames: parts.map((part) => part.fileName),
        indexFileName,
        toolName: "miku-text-bundle",
        toolVersion: CLI_VERSION,
    }), "utf8");
    return { indexPath, promptPath, partPaths };
}
function printVerboseSummary(files, skipped, parts, ignored) {
    console.log(`collected=${files.length}`);
    console.log(`skipped=${skipped.length}`);
    console.log(`parts=${parts.length}`);
    console.log(`ignoredDirectories=${ignored.directories}`);
    console.log(`ignoredFiles=${ignored.files}`);
    console.log(`ignoredByDirectory=${ignored.byDirectory}`);
    console.log(`ignoredByExtension=${ignored.byExtension}`);
    console.log(`ignoredByGitignore=${ignored.byGitignore}`);
    console.log(`ignoredByOutputDirectory=${ignored.byOutputDirectory}`);
}
function printGeneratedPaths(promptPath, partPaths, indexPath) {
    console.log(`generated: ${promptPath}`);
    for (const partPath of partPaths) {
        console.log(`generated: ${partPath}`);
    }
    console.log(`generated: ${indexPath}`);
}
function createTextBundle(options, now = new Date()) {
    void now;
    const inputPath = resolve(options.inputDirectory);
    const inputStat = statSync(inputPath, { throwIfNoEntry: false });
    if (!inputStat?.isDirectory()) {
        throw new Error(`Input directory does not exist: ${inputPath}`);
    }
    const outputDirectory = chooseOutputDirectory(options.outputDirectory);
    const filenamePrefix = normalizeFilenamePrefix(options.filenamePrefix ?? DEFAULT_FILENAME_PREFIX);
    mkdirSync(outputDirectory, { recursive: true });
    const gitignorePatterns = readRootGitignore(inputPath);
    const { files, skipped, ignored } = collectFiles(inputPath, outputDirectory, options, gitignorePatterns);
    const markers = files.flatMap((file) => file.markers);
    const { parts, warnings } = buildParts(files, options.maxChars, filenamePrefix);
    const { indexPath, promptPath, partPaths } = writeBundleMarkdownFiles({
        outputDirectory,
        filenamePrefix,
        inputDirectory: inputPath,
        parts,
        collectedFiles: files,
        skippedFiles: skipped,
        markers,
        warnings,
    });
    if (options.verbose) {
        printVerboseSummary(files, skipped, parts, ignored);
    }
    printGeneratedPaths(promptPath, partPaths, indexPath);
    return {
        outputDirectory,
        indexPath,
        promptPath,
        partPaths,
        filesCollected: files.length,
        filesSkipped: skipped.length,
        directoriesIgnored: ignored.directories,
        filesIgnored: ignored.files,
        ignoredByDirectory: ignored.byDirectory,
        ignoredByExtension: ignored.byExtension,
        ignoredByGitignore: ignored.byGitignore,
        ignoredByOutputDirectory: ignored.byOutputDirectory,
        partsGenerated: parts.length,
        warnings,
    };
}

// main.js
function isCliEntrypoint(metaUrl, argvPath) {
    if (!argvPath) {
        return false;
    }
    try {
        return realpathSync(fileURLToPath(metaUrl)) === realpathSync(argvPath);
    }
    catch {
        return false;
    }
}
function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const result = createTextBundle(options);
        console.log(`completed: ${result.partsGenerated} part(s), ${result.filesCollected} file(s) collected, ${result.filesSkipped} file(s) skipped, ${result.directoriesIgnored} directories ignored, ${result.filesIgnored} file(s) ignored`);
    }
    catch (error) {
        if (error instanceof HelpRequestedError) {
            printHelp();
            process.exit(0);
        }
        if (error instanceof VersionRequestedError) {
            printVersion();
            process.exit(0);
        }
        const message = error instanceof Error ? error.message : String(error);
        console.error(`error: ${message}`);
        printHelp();
        process.exit(1);
    }
}
if (isCliEntrypoint(import.meta.url, process.argv[1])) {
    main();
}

export {
  HelpRequestedError,
  VersionRequestedError,
  CLI_VERSION,
  DEFAULT_EXCLUDE_DIRECTORIES,
  DEFAULT_EXCLUDE_EXTENSIONS,
  parseArgs,
  printHelp,
  printVersion,
  createTextBundle,
  chooseOutputDirectory,
  discoverCandidateFiles,
  buildIndexMarkdown,
  buildPartMarkdown,
  buildPromptMarkdown,
  matchesAnyPattern,
  matchesGitignore,
  parseGitignore,
  getExtension,
  normalizePattern,
  toPosixPath,
  main,
};
