import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
	type BrandProblem,
	type NameRules,
	colourLiteralLines,
	findNameProblems,
} from "./rules.js";

/** Files read at all: code plus the copy and config the banned names hide in. */
export const DEFAULT_SOURCE_FILE =
	/\.(ts|tsx|js|mjs|cjs|go|proto|json|ya?ml|html|css)$/;
/** Directory names never entered (dot-directories are always skipped). */
export const DEFAULT_SKIP_DIRS: readonly string[] = [
	"node_modules",
	"dist",
	"generated",
];

export interface ColourRules {
	/** Directories whose CSS may not write a colour literal. */
	readonly dirs: readonly string[];
	/** The one CSS file colours are declared in (root-relative). */
	readonly tokenFile: string;
	/** What to do instead; default "add a token to <tokenFile>". */
	readonly hint?: string;
}

export interface CheckBrandOptions extends NameRules {
	/** Directory the scanned paths are relative to. */
	readonly root: string;
	/** Directories scanned recursively (root-relative). */
	readonly dirs: readonly string[];
	/** Single files scanned (root-relative), such as index.html. */
	readonly files?: readonly string[];
	/** Files read at all; default DEFAULT_SOURCE_FILE. */
	readonly sourceFile?: RegExp;
	/** Directory names skipped anywhere; default DEFAULT_SKIP_DIRS. */
	readonly skipDirs?: readonly string[];
	/** Root-relative paths (files or directories) never read. */
	readonly ignorePaths?: readonly string[];
	/** Colour literals outside the token file, for products that check them here. */
	readonly colours?: ColourRules;
}

function toPosix(relative: string): string {
	return relative.split(path.sep).join("/");
}

function isIgnored(relative: string, ignorePaths: readonly string[]): boolean {
	return ignorePaths.some(
		(ignored) => relative === ignored || relative.startsWith(`${ignored}/`),
	);
}

function requireExists(root: string, relative: string): string {
	const full = path.join(root, relative);
	if (!existsSync(full)) {
		throw new Error(`check-brand: ${relative} does not exist under ${root}`);
	}
	return full;
}

/** Root-relative paths of the files under `dir` that `accept` takes, sorted. */
function listFiles(
	root: string,
	dir: string,
	accept: (name: string) => boolean,
	skipDirs: ReadonlySet<string>,
	ignorePaths: readonly string[],
): string[] {
	const found: string[] = [];
	const walk = (full: string): void => {
		for (const name of readdirSync(full).sort()) {
			if (name.startsWith(".") || skipDirs.has(name)) continue;
			const child = path.join(full, name);
			const relative = toPosix(path.relative(root, child));
			if (isIgnored(relative, ignorePaths)) continue;
			if (statSync(child).isDirectory()) walk(child);
			else if (accept(name)) found.push(relative);
		}
	};
	walk(requireExists(root, dir));
	return found;
}

function normalizedIgnorePaths(options: CheckBrandOptions): string[] {
	return (options.ignorePaths ?? []).map((ignored) =>
		toPosix(path.normalize(ignored)).replace(/\/$/, ""),
	);
}

/**
 * The root-relative paths `checkBrand` reads for the name rules, sorted by
 * directory then name: the dirs walked (skipping skipDirs, dot-directories
 * and ignorePaths) plus the single files. Throws on a missing path.
 */
export function listScannedFiles(options: CheckBrandOptions): string[] {
	const root = path.resolve(options.root);
	const skipDirs = new Set(options.skipDirs ?? DEFAULT_SKIP_DIRS);
	const ignorePaths = normalizedIgnorePaths(options);
	const sourceFile = options.sourceFile ?? DEFAULT_SOURCE_FILE;
	const scanned = new Set<string>();
	for (const dir of options.dirs) {
		for (const file of listFiles(
			root,
			dir,
			(name) => sourceFile.test(name),
			skipDirs,
			ignorePaths,
		)) {
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
export function checkBrand(options: CheckBrandOptions): BrandProblem[] {
	const root = path.resolve(options.root);
	const skipDirs = new Set(options.skipDirs ?? DEFAULT_SKIP_DIRS);
	const ignorePaths = normalizedIgnorePaths(options);
	const scanned = listScannedFiles(options);

	const problems: BrandProblem[] = [];
	for (const file of scanned) {
		const text = readFileSync(path.join(root, file), "utf8");
		problems.push(...findNameProblems(text, file, options));
	}

	const colours = options.colours;
	if (colours !== undefined) {
		const tokenFile = toPosix(path.normalize(colours.tokenFile));
		const hint = colours.hint ?? `add a token to ${tokenFile}`;
		for (const dir of colours.dirs) {
			const cssFiles = listFiles(
				root,
				dir,
				(name) => name.endsWith(".css"),
				skipDirs,
				ignorePaths,
			);
			for (const file of cssFiles) {
				if (file === tokenFile) continue;
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
export function formatProblem(problem: BrandProblem): string {
	return `${problem.file}:${problem.line} ${problem.message}`;
}
