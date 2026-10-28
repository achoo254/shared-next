/**
 * The built package, loaded the way consumers load it: plain Node resolving
 * `@achoo254/app-switcher` through package.json `exports` (no Vite).
 * CI rebuilds dist/ before this and fails when it differs from the commit.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as srcIndex from "../src/index.js";

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
		for (const file of ["index.js", "index.d.ts", "app-switcher.css"]) {
			expect(
				existsSync(new URL(`../dist/${file}`, import.meta.url)),
				file,
			).toBe(true);
		}
	});

	it("ships the stylesheet of src unchanged", () => {
		const read = (path: string) =>
			readFileSync(new URL(path, import.meta.url), "utf8");
		expect(read("../dist/app-switcher.css")).toBe(
			read("../src/app-switcher.css"),
		);
	});

	it("exports through package.json what the sources export and builds links", () => {
		const loaded = JSON.parse(
			node(`
				const mod = await import("@achoo254/app-switcher");
				const links = mod.appSwitcherLinks({ current: "chat", domain: "hoandat.com", locale: "en" });
				const css = import.meta.resolve("@achoo254/app-switcher/app-switcher.css");
				process.stdout.write(JSON.stringify({ keys: Object.keys(mod).sort(), links: links.map((l) => l.href), css: css.endsWith("/dist/app-switcher.css") }));
			`),
		);
		expect(loaded).toEqual({
			keys: Object.keys(srcIndex).sort(),
			links: [
				"https://scribe.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://localman.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://tunnel.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://webnhanh.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://tieude.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://auth.hoandat.com/account?utm_source=chat&utm_medium=app_switcher",
			],
			css: true,
		});
	});

	it("keeps the marks out of the main entry's static imports (own chunk)", () => {
		const read = (file: string) =>
			readFileSync(new URL(`../dist/${file}`, import.meta.url), "utf8");
		const reached = new Set<string>();
		const queue = ["index.js"];
		for (let file = queue.shift(); file; file = queue.shift()) {
			if (reached.has(file)) continue;
			reached.add(file);
			for (const match of read(file).matchAll(STATIC_IMPORT)) {
				if (match[1]) queue.push(match[1]);
			}
		}
		expect(reached).toContain("icons.js");
		expect(reached).toContain("mark-loader.js");
		expect(reached).not.toContain("marks.js");
		expect(read("mark-loader.js")).toContain('import("./marks.js")');
	});
});

/** `import … from "./x.js"` and `export … from "./x.js"`, not `import()`. */
const STATIC_IMPORT = /^(?:import|export)\b[^;]*?\bfrom\s+"\.\/([^"]+)"/gm;
