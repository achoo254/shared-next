/**
 * Node-only entry: the check that fails when a product name is hard-coded
 * instead of read from brand.config.json, as a function (`checkBrand`), a
 * per-file scanner (`findNameProblems`) and a CLI (`runCli`, bin `check-brand`).
 */
export { DEFAULT_SKIP_DIRS, DEFAULT_SOURCE_FILE, checkBrand, formatProblem, listScannedFiles, } from "./check-brand/check-brand.js";
export { USAGE, parseCliArgs, runCli, } from "./check-brand/cli.js";
export { DEFAULT_CODE_FILE, DEFAULT_HTML_FILE, DEFAULT_IGNORE_MARKER, DEFAULT_TEST_FILE, appNameLiteralApplies, colourLiteralLines, escapeRegExp, findNameProblems, } from "./check-brand/rules.js";
