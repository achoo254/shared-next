import { type BrandProblem, type NameRules } from "./rules.js";
/** Files read at all: code plus the copy and config the banned names hide in. */
export declare const DEFAULT_SOURCE_FILE: RegExp;
/** Directory names never entered (dot-directories are always skipped). */
export declare const DEFAULT_SKIP_DIRS: readonly string[];
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
/**
 * The root-relative paths `checkBrand` reads for the name rules, sorted by
 * directory then name: the dirs walked (skipping skipDirs, dot-directories
 * and ignorePaths) plus the single files. Throws on a missing path.
 */
export declare function listScannedFiles(options: CheckBrandOptions): string[];
/**
 * Every hard-coded product name (and, with `colours`, colour literal) in
 * the scanned files. Throws when a listed directory or file is missing, so
 * a misspelt path cannot pass silently.
 */
export declare function checkBrand(options: CheckBrandOptions): BrandProblem[];
/** `file:line message`, the format editors and CI logs link. */
export declare function formatProblem(problem: BrandProblem): string;
