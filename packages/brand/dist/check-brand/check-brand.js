import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { colourLiteralLines, findNameProblems, } from "./rules.js";
/** Files read at all: code plus the copy and config the banned names hide in. */
export const DEFAULT_SOURCE_FILE = /\.(ts|tsx|js|mjs|cjs|go|proto|json|ya?ml|html|css)$/;
/** Directory names never entered (dot-directories are always skipped). */
export const DEFAULT_SKIP_DIRS = [
    "node_modules",
    "dist",
    "generated",
];
function toPosix(relative) {
    return relative.split(path.sep).join("/");
}
function isIgnored(relative, ignorePaths) {
    return ignorePaths.some((ignored) => relative === ignored || relative.startsWith(`${ignored}/`));
}
function requireExists(root, relative) {
    const full = path.join(root, relative);
    if (!existsSync(full)) {
        throw new Error(`check-brand: ${relative} does not exist under ${root}`);
    }
    return full;
}
/** Root-relative paths of the files under `dir` that `accept` takes, sorted. */
function listFiles(root, dir, accept, skipDirs, ignorePaths) {
    const found = [];
    const walk = (full) => {
        for (const name of readdirSync(full).sort()) {
            if (name.startsWith(".") || skipDirs.has(name))
                continue;
            const child = path.join(full, name);
            const relative = toPosix(path.relative(root, child));
            if (isIgnored(relative, ignorePaths))
                continue;
            if (statSync(child).isDirectory())
                walk(child);
            else if (accept(name))
                found.push(relative);
        }
    };
    walk(requireExists(root, dir));
    return found;
}
function normalizedIgnorePaths(options) {
    return (options.ignorePaths ?? []).map((ignored) => toPosix(path.normalize(ignored)).replace(/\/$/, ""));
}
/**
 * The root-relative paths `checkBrand` reads for the name rules, sorted by
 * directory then name: the dirs walked (skipping skipDirs, dot-directories
 * and ignorePaths) plus the single files. Throws on a missing path.
 */
export function listScannedFiles(options) {
    const root = path.resolve(options.root);
    const skipDirs = new Set(options.skipDirs ?? DEFAULT_SKIP_DIRS);
    const ignorePaths = normalizedIgnorePaths(options);
    const sourceFile = options.sourceFile ?? DEFAULT_SOURCE_FILE;
    const scanned = new Set();
    for (const dir of options.dirs) {
        for (const file of listFiles(root, dir, (name) => sourceFile.test(name), skipDirs, ignorePaths)) {
            scanned.add(file);
        }
    }
    for (const file of options.files ?? []) {
        requireExists(root, file);
        scanned.add(toPosix(path.normalize(file)));
    }
    return [...scanned];
}
/**
 * Every hard-coded product name (and, with `colours`, colour literal) in
 * the scanned files. Throws when a listed directory or file is missing, so
 * a misspelt path cannot pass silently.
 */
export function checkBrand(options) {
    const root = path.resolve(options.root);
    const skipDirs = new Set(options.skipDirs ?? DEFAULT_SKIP_DIRS);
    const ignorePaths = normalizedIgnorePaths(options);
    const scanned = listScannedFiles(options);
    const problems = [];
    for (const file of scanned) {
        const text = readFileSync(path.join(root, file), "utf8");
        problems.push(...findNameProblems(text, file, options));
    }
    const colours = options.colours;
    if (colours !== undefined) {
        const tokenFile = toPosix(path.normalize(colours.tokenFile));
        const hint = colours.hint ?? `add a token to ${tokenFile}`;
        for (const dir of colours.dirs) {
            const cssFiles = listFiles(root, dir, (name) => name.endsWith(".css"), skipDirs, ignorePaths);
            for (const file of cssFiles) {
                if (file === tokenFile)
                    continue;
                const css = readFileSync(path.join(root, file), "utf8");
                for (const line of colourLiteralLines(css)) {
                    problems.push({
                        file,
                        line,
                        rule: "colour",
                        message: `writes a colour; ${hint}`,
                    });
                }
            }
        }
    }
    return problems;
}
/** `file:line message`, the format editors and CI logs link. */
export function formatProblem(problem) {
    return `${problem.file}:${problem.line} ${problem.message}`;
}
