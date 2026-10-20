import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	type NameRules,
	checkBrand,
	colourLiteralLines,
	findNameProblems,
	formatProblem,
	runCli,
} from "../src/check-brand.js";
import { consumer } from "./consumers.js";

const lines = (text: string, file: string, rules: NameRules) =>
	findNameProblems(text, file, rules).map((problem) => problem.line);

describe("chat rules", () => {
	const rules: NameRules = {
		appName: "Chat",
		bannedNames: ["chat-inet"],
		testFile: /(\/test\/|_test\.go$|\.test\.ts$)/,
		hint: "read it from @app/brand",
	};

	it("bans the former repo name anywhere, tests included, any case", () => {
		expect(
			findNameProblems("// Chat-Inet", "apps/web/test/a.ts", rules),
		).toEqual([
			{
				file: "apps/web/test/a.ts",
				line: 1,
				rule: "banned-name",
				message: 'contains "chat-inet"',
			},
		]);
		expect(lines("x: chat-inet", "deploy/a.yaml", rules)).toEqual([1]);
	});

	it("flags the name literal in TS and Go code, with the hint", () => {
		const [problem] = findNameProblems(
			'const n = "Chat";',
			"apps/web/src/a.ts",
			rules,
		);
		expect(problem?.message).toBe(
			'hard-codes the product name "Chat"; read it from @app/brand',
		);
		expect(lines('name := "Chat"', "server/a.go", rules)).toEqual([1]);
		expect(lines('name := "Chat"', "server/a_test.go", rules)).toEqual([]);
		expect(lines('"name": "Chat"', "apps/web/a.json", rules)).toEqual([]);
	});
});

describe("scribe rules", () => {
	const rules: NameRules = {
		appName: "Scribe",
		bannedNames: ["OneScribe"],
		testFile: /(^|\/)(e2e|test)\/|\.(test|spec)\.tsx?$/,
		htmlWord: true,
	};

	it("flags the product name as a whole string literal in code", () => {
		const text = 'const a = "x";\nconst name = "Scribe";\nconst b = `Scribe`;';
		expect(lines(text, "src/lib/x.ts", rules)).toEqual([2, 3]);
	});

	it("leaves sentences, identifiers and other words alone", () => {
		const text =
			'title: "Hỏi Scribe",\nexport function askScribe() {}\nconst key = "scribe-theme";';
		expect(findNameProblems(text, "src/i18n/x.ts", rules)).toEqual([]);
	});

	it("skips the literal rule in tests and e2e", () => {
		const text = 'expect(x).toBe("Scribe");';
		expect(findNameProblems(text, "src/a.test.tsx", rules)).toEqual([]);
		expect(findNameProblems(text, "e2e/specs/a.spec.ts", rules)).toEqual([]);
		expect(findNameProblems(text, "brand/test/a.ts", rules)).toEqual([]);
	});

	it("flags the name in HTML, which has %APP_NAME%", () => {
		expect(
			findNameProblems("<title>Scribe · x</title>", "index.html", rules),
		).toEqual([
			{
				file: "index.html",
				line: 1,
				rule: "app-name",
				message: 'hard-codes the product name "Scribe"; use %APP_NAME%',
			},
		]);
		expect(lines("<title>%APP_NAME% · x</title>", "index.html", rules)).toEqual(
			[],
		);
	});

	it("bans the former name anywhere, in any case", () => {
		expect(lines("// oneScribe web", "src/a.test.ts", rules)).toEqual([1]);
	});

	it("escapes regex characters of the name", () => {
		const dotted = { ...rules, appName: "A.B" };
		expect(lines('const a = "A.B";', "x.ts", dotted)).toEqual([1]);
		expect(lines('const a = "AxB";', "x.ts", dotted)).toEqual([]);
	});
});

describe("localman rules", () => {
	// localman's --test-file: its apps/web/src/test/ helpers are app code.
	const testFile =
		/\.test\.[cm]?[jt]sx?$|\/__tests__\/|\/testing\/|\/test-support\//;
	const scan = (source: string, file = "apps/web/src/a.ts") =>
		lines(source, file, { appName: "Localman", testFile });

	it("flags the product name as a whole string literal in any quote", () => {
		const source = [
			'const a = "Localman";',
			"const b = 'Localman';",
			"const c = `Localman`;",
		].join("\n");
		expect(scan(source)).toEqual([1, 2, 3]);
	});

	it("lets sentences and identifiers that contain the name pass", () => {
		const source = [
			'const header = "X-Localman-Proxy";',
			'const summary = "Send a request through the Localman proxy";',
			"const title = `${page} · ${brand.appName}`;",
			'const other = "Tunelo";',
		].join("\n");
		expect(scan(source)).toEqual([]);
	});

	it("skips a line with a reasoned ignore marker, not a bare one", () => {
		expect(
			scan('const t = "Localman"; // check-brand-ignore: static file'),
		).toEqual([]);
		expect(scan('const t = "Localman"; // check-brand-ignore:')).toEqual([1]);
		expect(
			lines('const t = "Localman"; // check-brand-ignore: x', "a.ts", {
				appName: "Localman",
				ignoreMarker: null,
			}),
		).toEqual([1]);
	});

	it("checks code only, never tests or other files", () => {
		const literal = 'x = "Localman";';
		expect(scan(literal, "apps/api/src/a.ts")).toEqual([1]);
		expect(scan(literal, "apps/web/public/sw.js")).toEqual([1]);
		expect(scan(literal, "apps/web/src/a.test.tsx")).toEqual([]);
		expect(scan(literal, "apps/tunelo-server/src/__tests__/a.ts")).toEqual([]);
		expect(scan(literal, "apps/api/src/modules/auth/testing/fake.ts")).toEqual(
			[],
		);
		expect(scan(literal, "apps/web/src/i18n/messages/en/layout.json")).toEqual(
			[],
		);
	});

	it("keeps checking the apps/web/src/test/ helpers, as today", () => {
		expect(scan('x = "Localman";', "apps/web/src/test/fixtures.ts")).toEqual([
			1,
		]);
	});
});

describe("default test pattern", () => {
	it("knows tests by their own name and __tests__/ only", () => {
		const rules = { appName: "App" };
		const literal = 'x = "App";';
		for (const file of [
			"src/a.test.ts",
			"src/a.spec.tsx",
			"src/a.test.mjs",
			"server/a_test.go",
			"src/__tests__/a.ts",
		]) {
			expect(lines(literal, file, rules), file).toEqual([]);
		}
		for (const file of [
			"apps/web/src/test/setup.ts",
			"e2e/helpers.ts",
			"src/testing/fake.ts",
		]) {
			expect(lines(literal, file, rules), file).toEqual([1]);
		}
	});
});

describe("miu rules", () => {
	const rules: NameRules = {
		appName: "Miu World",
		jsxText: true,
		skipCommentLines: true,
	};

	it("finds the name as a whole string or JSX text, not in a sentence or comment", () => {
		const source = [
			"const a = 'Miu World';",
			'const b = "Miu World";',
			"const c = `Miu World`;",
			'<h1 className="x">Miu World</h1>',
			"const d = 'Chào mừng tới Miu World!';",
			'/** The game title "Miu World". */',
			"// 'Miu World'",
			"<p>Về Miu World</p>",
		].join("\n");
		expect(lines(source, "apps/web/src/a.tsx", rules)).toEqual([1, 2, 3, 4]);
	});

	it("finds colours in CSS, not tokens, ids or comments", () => {
		const css = [
			".a { color: #fff; }",
			".b { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }",
			".c { color: var(--color-ink); }",
			"/* was #ffffff, see",
			"   rgb(1, 2, 3) */",
			".d { background: hsl(10 20% 30%); }",
			".e { color: #12345; }",
			'a[href="#top"] { color: var(--color-primary); }',
			".f { border-color: #aabbccdd; }",
		].join("\n");
		expect(colourLiteralLines(css)).toEqual([1, 2, 6, 9]);
	});
});

describe("checkBrand", () => {
	let root = "";
	beforeEach(() => {
		root = mkdtempSync(path.join(os.tmpdir(), "check-brand-"));
	});
	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
	});

	function write(file: string, text: string): void {
		const full = path.join(root, file);
		mkdirSync(path.dirname(full), { recursive: true });
		writeFileSync(full, text);
	}

	it("reports code and UI CSS, and leaves tests, tokens, skipped and ignored paths alone", () => {
		const tokenFile = "apps/web/src/ui/tokens.css";
		write("apps/server/src/mail.ts", "const SENDER = 'Miu World';\n");
		write("apps/server/src/mail.test.ts", "expect(x).toBe('Miu World');\n");
		write("apps/web/e2e/flow.spec.ts", "getByText('Miu World');\n");
		write("apps/web/dist/bundle.js", "x='Miu World'\n");
		write("apps/web/.cache/a.js", "x='Miu World'\n");
		write("apps/web/public/sw.js", "x='Miu World'\n");
		write("apps/web/src/ui/kit/x.css", ".x {\n  color: #333;\n}\n");
		write(tokenFile, ":root { --color-ink: #2b2140; }\n");
		write("apps/web/src/game/game.css", ".hud { color: #fff; }\n");
		write("apps/web/src/seo/page.css", ".p { color: rgb(1, 2, 3); }\n");
		write("packages/brand/src/a.ts", "x = 1;\n");

		const problems = checkBrand({
			root,
			appName: "Miu World",
			dirs: ["apps", "packages"],
			ignorePaths: ["apps/web/public/"],
			jsxText: true,
			skipCommentLines: true,
			hint: "read it from @miu/brand",
			colours: {
				dirs: ["apps/web/src/ui", "apps/web/src/seo"],
				tokenFile,
				hint: `add a token to ${tokenFile} and use var(--color-…)`,
			},
		});
		expect(problems.map(formatProblem)).toEqual([
			'apps/server/src/mail.ts:1 hard-codes the product name "Miu World"; read it from @miu/brand',
			`apps/web/src/ui/kit/x.css:2 writes a colour; add a token to ${tokenFile} and use var(--color-…)`,
			`apps/web/src/seo/page.css:1 writes a colour; add a token to ${tokenFile} and use var(--color-…)`,
		]);
	});

	it("scans single files, and fails on a path that does not exist", () => {
		write("index.html", "<title>Scribe</title>\n");
		write("src/a.ts", "x = 1;\n");
		const options = {
			root,
			appName: "Scribe",
			dirs: ["src"],
			files: ["index.html"],
			htmlWord: true,
		};
		expect(checkBrand(options).map(formatProblem)).toEqual([
			'index.html:1 hard-codes the product name "Scribe"; use %APP_NAME%',
		]);
		expect(() => checkBrand({ ...options, dirs: ["sdk"] })).toThrow(
			/sdk does not exist/,
		);
		expect(() => checkBrand({ ...options, files: ["vite.config.ts"] })).toThrow(
			/vite.config.ts does not exist/,
		);
	});

	it("skips extra directory names when asked", () => {
		write("scripts/check-brand/rules.ts", "const banned = 'OneScribe';\n");
		const options = {
			root,
			appName: "Scribe",
			dirs: ["scripts"],
			bannedNames: ["OneScribe"],
		};
		expect(checkBrand(options)).toHaveLength(1);
		expect(
			checkBrand({
				...options,
				skipDirs: ["node_modules", "dist", "generated", "check-brand"],
			}),
		).toEqual([]);
	});
});

describe("runCli", () => {
	let root = "";
	const output = { logs: [] as string[], errors: [] as string[] };
	const io = {
		log: (message: string) => output.logs.push(message),
		error: (message: string) => output.errors.push(message),
	};
	beforeEach(() => {
		root = mkdtempSync(path.join(os.tmpdir(), "check-brand-cli-"));
		output.logs = [];
		output.errors = [];
	});
	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
	});

	function write(file: string, text: string): void {
		const full = path.join(root, file);
		mkdirSync(path.dirname(full), { recursive: true });
		writeFileSync(full, text);
	}

	it("validates --config, takes appName from it and exits 0 when clean", () => {
		const chatRoot = fileURLToPath(consumer("chat").root);
		write("apps/a.ts", "const name = brand.appName;\n");
		const config = path.join(chatRoot, "brand.config.json");
		expect(runCli(["--config", config, "--dir", "apps"], io, root)).toBe(0);
		expect(output.logs).toEqual(['✓ check-brand: no hard-coded "Chat"']);
	});

	it("exits 1 listing each problem", () => {
		write("apps/a.ts", 'const name = "Chat";\n');
		write("apps/b.ts", "// chat-inet\n");
		const status = runCli(
			[
				"--app-name",
				"Chat",
				"--dir",
				"apps",
				"--banned",
				"chat-inet",
				"--hint",
				"read it from @app/brand",
			],
			io,
			root,
		);
		expect(status).toBe(1);
		expect(output.errors).toEqual([
			'✗ 2 brand problem(s):\napps/a.ts:1 hard-codes the product name "Chat"; read it from @app/brand\napps/b.ts:1 contains "chat-inet"',
		]);
	});

	it("passes the rule flags through", () => {
		write("src/a.tsx", "<h1>Miu World</h1>\n");
		write("src/x/skip.ts", "x = 'Miu World';\n");
		write("src/ui/a.css", ".a { color: #fff; }\n");
		write("src/ui/tokens.css", ":root { --a: #fff; }\n");
		const status = runCli(
			[
				"--app-name",
				"Miu World",
				"--dir",
				"src",
				"--jsx-text",
				"--skip-dir",
				"x",
				"--colour-dir",
				"src/ui",
				"--token-file",
				"src/ui/tokens.css",
			],
			io,
			root,
		);
		expect(status).toBe(1);
		expect(output.errors[0]?.split("\n").slice(1)).toEqual([
			'src/a.tsx:1 hard-codes the product name "Miu World"',
			"src/ui/a.css:1 writes a colour; add a token to src/ui/tokens.css",
		]);
	});

	it("exits 2 on a usage or configuration error", () => {
		write("apps/a.ts", "x\n");
		const cases = [
			["--dir", "apps"],
			["--app-name", "X", "--config", "a.json", "--dir", "apps"],
			["--app-name", "X"],
			["--app-name", "X", "--dir", "apps", "--unknown"],
			["--app-name", "X", "--dir", "apps", "--test-file", "("],
			["--app-name", "X", "--dir", "apps", "--colour-dir", "apps"],
			["--app-name", "X", "--dir", "missing"],
			["--config", "missing.json", "--dir", "apps"],
		];
		for (const argv of cases) {
			expect(runCli(argv, io, root), argv.join(" ")).toBe(2);
		}
		write("bad.json", '{"appName": "X"}');
		expect(runCli(["--config", "bad.json", "--dir", "apps"], io, root)).toBe(2);
		expect(output.errors.at(-1)).toMatch(/brand.config.json is invalid/);
	});

	it("prints the usage for --help", () => {
		expect(runCli(["--help"], io, root)).toBe(0);
		expect(output.logs[0]).toMatch(/^Usage: check-brand/);
	});
});
