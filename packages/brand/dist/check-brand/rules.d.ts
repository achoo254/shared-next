/**
 * Rules for a product name written by hand instead of read from the brand
 * config, applied to one file's text. Each product turns on the rules it
 * uses (see NameRules); the defaults are the ones all four products share.
 */
export type BrandRule = "banned-name" | "app-name" | "colour";
export interface BrandProblem {
    /** Root-relative path with `/` separators. */
    readonly file: string;
    /** 1-based line number. */
    readonly line: number;
    readonly rule: BrandRule;
    readonly message: string;
}
/** Code where a product name literal is a constant someone typed. */
export declare const DEFAULT_CODE_FILE: RegExp;
/**
 * Tests may name the product as fixture data. The default only knows test
 * files by their own name (and __tests__/): directories such as test/ or
 * e2e/ hold app helpers in one product and tests in another, so a product
 * names those with `testFile` (`--test-file`). Narrow on purpose: an unknown
 * file is checked rather than skipped.
 */
export declare const DEFAULT_TEST_FILE: RegExp;
export declare const DEFAULT_HTML_FILE: RegExp;
/**
 * A line holding this marker and a non-empty reason after it is skipped
 * by the app-name rules; the reason is mandatory so every exception
 * documents itself.
 */
export declare const DEFAULT_IGNORE_MARKER = "check-brand-ignore:";
export interface NameRules {
    /** brand.config.json appName. */
    readonly appName: string;
    /** Former names banned anywhere, tests included, in any case. */
    readonly bannedNames?: readonly string[];
    /** Files the appName literal rule applies to. */
    readonly codeFile?: RegExp;
    /** Files the appName rules skip. */
    readonly testFile?: RegExp;
    /** Flag appName as a word in HTML, which has the %APP_NAME% placeholder. */
    readonly htmlWord?: boolean;
    /** Flag appName as the whole text of a JSX element: `>Name<`. */
    readonly jsxText?: boolean;
    /** Let lines that are all comment quote the name. */
    readonly skipCommentLines?: boolean;
    /** `null` turns the ignore marker off. */
    readonly ignoreMarker?: string | null;
    /** Where code should read the name from, appended to the message. */
    readonly hint?: string;
}
export declare function escapeRegExp(value: string): string;
/** Whether the appName literal rule checks `file`: code that is not a test. */
export declare function appNameLiteralApplies(file: string, rules: NameRules): boolean;
/** Problems in `text`, the content of `file` (root-relative, `/` separators). */
export declare function findNameProblems(text: string, file: string, rules: NameRules): BrandProblem[];
/** Lines (1-based) of a CSS file that write a colour literal, comments left out. */
export declare function colourLiteralLines(css: string): number[];
