/**
 * Node-only entry: the check that fails when a product name is hard-coded
 * instead of read from brand.config.json, as a function (`checkBrand`), a
 * per-file scanner (`findNameProblems`) and a CLI (`runCli`, bin `check-brand`).
 */
export {
	type CheckBrandOptions,
	type ColourRules,
	DEFAULT_SKIP_DIRS,
	DEFAULT_SOURCE_FILE,
	checkBrand,
	formatProblem,
	listScannedFiles,
} from "./check-brand/check-brand.js";
export {
	type CliOutput,
	USAGE,
	parseCliArgs,
	runCli,
} from "./check-brand/cli.js";
export {
	type BrandProblem,
	type BrandRule,
	DEFAULT_CODE_FILE,
	DEFAULT_HTML_FILE,
	DEFAULT_IGNORE_MARKER,
	DEFAULT_TEST_FILE,
	type NameRules,
	appNameLiteralApplies,
	colourLiteralLines,
	escapeRegExp,
	findNameProblems,
} from "./check-brand/rules.js";
