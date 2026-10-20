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
export const DEFAULT_CODE_FILE = /\.(ts|tsx|js|mjs|cjs|go)$/;
/**
 * Tests may name the product as fixture data. The default only knows test
 * files by their own name (and __tests__/): directories such as test/ or
 * e2e/ hold app helpers in one product and tests in another, so a product
 * names those with `testFile` (`--test-file`). Narrow on purpose: an unknown
 * file is checked rather than skipped.
 */
export const DEFAULT_TEST_FILE =
	/\.(test|spec)\.[cm]?[jt]sx?$|_test\.go$|(^|\/)__tests__\//;
export const DEFAULT_HTML_FILE = /\.html$/;
/**
 * A line holding this marker and a non-empty reason after it is skipped
 * by the app-name rules; the reason is mandatory so every exception
 * documents itself.
 */
export const DEFAULT_IGNORE_MARKER = "check-brand-ignore:";

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

/** A line that is all comment (`//`, `/*`, or a `*` line of a block comment). */
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;

/** Same pattern as miu-world-next's ESLint COLOUR_LITERAL. */
const COLOUR_LITERAL =
	/(^|[^&\w])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasIgnoreMarker(line: string, marker: string | null): boolean {
	if (marker === null || marker === "") return false;
	const index = line.indexOf(marker);
	return index !== -1 && line.slice(index + marker.length).trim() !== "";
}

/** Whether the appName literal rule checks `file`: code that is not a test. */
export function appNameLiteralApplies(file: string, rules: NameRules): boolean {
	return (
		!(rules.testFile ?? DEFAULT_TEST_FILE).test(file) &&
		(rules.codeFile ?? DEFAULT_CODE_FILE).test(file)
	);
}

/** Problems in `text`, the content of `file` (root-relative, `/` separators). */
export function findNameProblems(
	text: string,
	file: string,
	rules: NameRules,
): BrandProblem[] {
	if (rules.appName === "") throw new Error("check-brand: appName is empty");
	const name = escapeRegExp(rules.appName);
	const literal = new RegExp(
		rules.jsxText === true
			? `(["'\`])${name}\\1|>\\s*${name}\\s*<`
			: `(["'\`])${name}\\1`,
	);
	const word = new RegExp(`\\b${name}\\b`);
	const banned = (rules.bannedNames ?? []).map((former) => ({
		former,
		pattern: new RegExp(escapeRegExp(former), "i"),
	}));
	const checkLiteral = appNameLiteralApplies(file, rules);
	const checkWord =
		rules.htmlWord === true &&
		DEFAULT_HTML_FILE.test(file) &&
		!(rules.testFile ?? DEFAULT_TEST_FILE).test(file);
	const marker =
		rules.ignoreMarker === undefined
			? DEFAULT_IGNORE_MARKER
			: rules.ignoreMarker;
	const hint = rules.hint === undefined ? "" : `; ${rules.hint}`;

	const problems: BrandProblem[] = [];
	text.split("\n").forEach((content, index) => {
		const line = index + 1;
		for (const { former, pattern } of banned) {
			if (pattern.test(content)) {
				problems.push({
					file,
					line,
					rule: "banned-name",
					message: `contains "${former}"`,
				});
			}
		}
		if (!checkLiteral && !checkWord) return;
		if (hasIgnoreMarker(content, marker)) return;
		if (rules.skipCommentLines === true && COMMENT_LINE.test(content)) return;
		if (checkLiteral && literal.test(content)) {
			problems.push({
				file,
				line,
				rule: "app-name",
				message: `hard-codes the product name "${rules.appName}"${hint}`,
			});
		}
		if (checkWord && word.test(content)) {
			problems.push({
				file,
				line,
				rule: "app-name",
				message: `hard-codes the product name "${rules.appName}"; use %APP_NAME%`,
			});
		}
	});
	return problems;
}

/** Lines (1-based) of a CSS file that write a colour literal, comments left out. */
export function colourLiteralLines(css: string): number[] {
	// Blank out comments but keep their newlines, so line numbers stay right.
	const code = css.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
		comment.replace(/[^\n]/g, " "),
	);
	return code
		.split("\n")
		.flatMap((line, index) => (COLOUR_LITERAL.test(line) ? [index + 1] : []));
}
