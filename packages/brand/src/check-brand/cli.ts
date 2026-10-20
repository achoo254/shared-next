import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { parseBrandConfig } from "../build/config.js";
import {
	type CheckBrandOptions,
	DEFAULT_SKIP_DIRS,
	checkBrand,
	formatProblem,
} from "./check-brand.js";

export const USAGE = `Usage: check-brand [options]

Fails when the product name is hard-coded instead of read from brand.config.json.

  --config <file>        brand.config.json to validate and take appName from
  --app-name <name>      appName, instead of --config
  --root <dir>           directory the paths are relative to (default: cwd)
  --dir <dir>            directory to scan, recursively (repeatable, required)
  --file <file>          single file to scan (repeatable)
  --banned <name>        former name banned anywhere, any case (repeatable)
  --skip-dir <name>      directory name to skip, added to ${DEFAULT_SKIP_DIRS.join(", ")} (repeatable)
  --ignore-path <path>   root-relative file or directory never read (repeatable)
  --source-file <regex>  files read at all
  --code-file <regex>    files the appName literal rule applies to
  --test-file <regex>    files the appName rules skip
  --ignore-marker <text> marker that skips a line when a reason follows it
  --html-word            flag appName as a word in HTML (use %APP_NAME%)
  --jsx-text             flag appName as the whole text of a JSX element
  --skip-comment-lines   let comment-only lines quote the name
  --hint <text>          where code should read the name from
  --colour-dir <dir>     directory whose CSS may not write colours (repeatable)
  --token-file <file>    the one CSS file colours are declared in
  --help                 show this text

Exit status: 0 clean, 1 problems found, 2 usage or configuration error.`;

export interface CliOutput {
	log(message: string): void;
	error(message: string): void;
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function regex(value: string, flag: string): RegExp {
	try {
		return new RegExp(value);
	} catch (error) {
		throw new Error(`${flag}: ${errorMessage(error)}`);
	}
}

function readAppName(configFile: string): string {
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(configFile, "utf8"));
	} catch (error) {
		throw new Error(`--config ${configFile}: ${errorMessage(error)}`);
	}
	return parseBrandConfig(parsed).appName;
}

/** Options of `checkBrand` from command-line arguments. */
export function parseCliArgs(
	argv: readonly string[],
	cwd: string = process.cwd(),
): CheckBrandOptions | "help" {
	const { values } = parseArgs({
		args: [...argv],
		strict: true,
		allowPositionals: false,
		options: {
			config: { type: "string" },
			"app-name": { type: "string" },
			root: { type: "string" },
			dir: { type: "string", multiple: true },
			file: { type: "string", multiple: true },
			banned: { type: "string", multiple: true },
			"skip-dir": { type: "string", multiple: true },
			"ignore-path": { type: "string", multiple: true },
			"source-file": { type: "string" },
			"code-file": { type: "string" },
			"test-file": { type: "string" },
			"ignore-marker": { type: "string" },
			"html-word": { type: "boolean" },
			"jsx-text": { type: "boolean" },
			"skip-comment-lines": { type: "boolean" },
			hint: { type: "string" },
			"colour-dir": { type: "string", multiple: true },
			"token-file": { type: "string" },
			help: { type: "boolean" },
		},
	});
	if (values.help === true) return "help";

	const root = path.resolve(cwd, values.root ?? ".");
	if ((values.config === undefined) === (values["app-name"] === undefined)) {
		throw new Error("give exactly one of --config and --app-name");
	}
	const appName =
		values["app-name"] ?? readAppName(path.resolve(root, values.config ?? ""));
	if (appName === "") throw new Error("--app-name is empty");
	const dirs = values.dir ?? [];
	if (dirs.length === 0 && (values.file ?? []).length === 0) {
		throw new Error("give at least one --dir or --file");
	}
	const colourDirs = values["colour-dir"] ?? [];
	const tokenFile = values["token-file"];
	if (colourDirs.length > 0 !== (tokenFile !== undefined)) {
		throw new Error("--colour-dir and --token-file go together");
	}

	const skipDirs = values["skip-dir"];
	const sourceFile = values["source-file"];
	const codeFile = values["code-file"];
	const testFile = values["test-file"];
	// exactOptionalPropertyTypes: unset options stay out instead of undefined.
	return {
		root,
		appName,
		dirs,
		...(values.file === undefined ? {} : { files: values.file }),
		...(values.banned === undefined ? {} : { bannedNames: values.banned }),
		...(skipDirs === undefined
			? {}
			: { skipDirs: [...DEFAULT_SKIP_DIRS, ...skipDirs] }),
		...(values["ignore-path"] === undefined
			? {}
			: { ignorePaths: values["ignore-path"] }),
		...(sourceFile === undefined
			? {}
			: { sourceFile: regex(sourceFile, "--source-file") }),
		...(codeFile === undefined
			? {}
			: { codeFile: regex(codeFile, "--code-file") }),
		...(testFile === undefined
			? {}
			: { testFile: regex(testFile, "--test-file") }),
		...(values["ignore-marker"] === undefined
			? {}
			: { ignoreMarker: values["ignore-marker"] }),
		...(values["html-word"] === undefined
			? {}
			: { htmlWord: values["html-word"] }),
		...(values["jsx-text"] === undefined
			? {}
			: { jsxText: values["jsx-text"] }),
		...(values["skip-comment-lines"] === undefined
			? {}
			: { skipCommentLines: values["skip-comment-lines"] }),
		...(values.hint === undefined ? {} : { hint: values.hint }),
		...(tokenFile === undefined
			? {}
			: { colours: { dirs: colourDirs, tokenFile } }),
	};
}

/** Runs the check for `argv`; returns the exit status. */
export function runCli(
	argv: readonly string[],
	output: CliOutput = console,
	cwd: string = process.cwd(),
): number {
	let options: CheckBrandOptions | "help";
	try {
		options = parseCliArgs(argv, cwd);
	} catch (error) {
		output.error(`check-brand: ${errorMessage(error)}\n\n${USAGE}`);
		return 2;
	}
	if (options === "help") {
		output.log(USAGE);
		return 0;
	}
	try {
		const problems = checkBrand(options);
		if (problems.length > 0) {
			output.error(
				`✗ ${problems.length} brand problem(s):\n${problems.map(formatProblem).join("\n")}`,
			);
			return 1;
		}
		output.log(`✓ check-brand: no hard-coded "${options.appName}"`);
		return 0;
	} catch (error) {
		output.error(`check-brand: ${errorMessage(error)}`);
		return 2;
	}
}
