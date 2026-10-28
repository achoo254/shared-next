/**
 * The built package, loaded the way consumers load it: plain Node resolving
 * `@achoo254/app-shell` through package.json `exports` (no Vite).
 * CI rebuilds dist/ before this and fails when it differs from the commit.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as srcIndex from "../src/index.js";
import * as srcPreferences from "../src/preferences.js";

const PACKAGE_DIR = fileURLToPath(new URL("../", import.meta.url));

/** Runs an ES module script with plain Node inside the package. */
function node(script: string): string {
	return execFileSync(
		process.execPath,
		["--input-type=module", "--eval", script],
		{ cwd: PACKAGE_DIR, encoding: "utf8" },
	);
}

describe("dist", () => {
	it("is built (run pnpm build)", () => {
		for (const file of [
			"index.js",
			"index.d.ts",
			"preferences.js",
			"tokens.css",
			"app-shell.css",
			"app-shell-enhance.js",
		]) {
			expect(
				existsSync(new URL(`../dist/${file}`, import.meta.url)),
				file,
			).toBe(true);
		}
	});

	it("ships the stylesheets of src unchanged", () => {
		const read = (path: string) =>
			readFileSync(new URL(path, import.meta.url), "utf8");
		for (const file of ["tokens.css", "app-shell.css"]) {
			expect(read(`../dist/${file}`), file).toBe(read(`../src/${file}`));
		}
	});

	it("exports through package.json what the sources export, and renders on a server", () => {
		const loaded = JSON.parse(
			node(`
				const { createElement } = await import("react");
				const { renderToStaticMarkup } = await import("react-dom/server");
				const mod = await import("@achoo254/app-shell");
				const prefs = await import("@achoo254/app-shell/preferences");
				const html = renderToStaticMarkup(createElement(mod.SignInCard, {
					brand: { appName: "Chat", domain: "hoandat.com", markSrc: "/m.webp" },
					locale: "en", signInHref: "/login", title: "Chat",
				}));
				const css = ["tokens.css", "app-shell.css", "app-shell-enhance.js"].map((file) =>
					import.meta.resolve("@achoo254/app-shell/" + file).endsWith("/dist/" + file));
				process.stdout.write(JSON.stringify({
					keys: Object.keys(mod).sort(),
					prefsKeys: Object.keys(prefs).sort(),
					cta: html.includes(">Sign in with hoandat.com</a>"),
					css,
				}));
			`),
		);
		expect(loaded).toEqual({
			keys: Object.keys(srcIndex).sort(),
			prefsKeys: Object.keys(srcPreferences).sort(),
			cta: true,
			css: [true, true, true],
		});
	});

	it("keeps the preferences entry free of React", () => {
		const reached = new Set<string>();
		const queue = ["preferences.js"];
		const imports: string[] = [];
		for (let file = queue.shift(); file; file = queue.shift()) {
			if (reached.has(file)) continue;
			reached.add(file);
			const source = readFileSync(
				new URL(`../dist/${file}`, import.meta.url),
				"utf8",
			);
			for (const match of source.matchAll(IMPORT)) {
				const target = match[1] ?? "";
				if (target.startsWith("./")) queue.push(target.slice(2));
				else imports.push(target);
			}
		}
		expect(imports).toEqual(["@achoo254/brand/hosts"]);
	});
});

/** `import … from "x"` and `export … from "x"`. */
const IMPORT = /^(?:import|export)\b[^;]*?\bfrom\s+"([^"]+)"/gm;
