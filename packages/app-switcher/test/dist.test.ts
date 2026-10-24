/**
 * The built package, loaded the way consumers load it: plain Node resolving
 * `@shared-next/app-switcher` through package.json `exports` (no Vite).
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
				const mod = await import("@shared-next/app-switcher");
				const links = mod.appSwitcherLinks({ current: "chat", tenantDomain: "hoandat.com", isPrimaryTenant: false, locale: "en" });
				const css = import.meta.resolve("@shared-next/app-switcher/app-switcher.css");
				process.stdout.write(JSON.stringify({ keys: Object.keys(mod).sort(), links: links.map((l) => l.href), css: css.endsWith("/dist/app-switcher.css") }));
			`),
		);
		expect(loaded).toEqual({
			keys: Object.keys(srcIndex).sort(),
			links: [
				"https://localman.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://tunnel.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
				"https://auth.hoandat.com/account?utm_source=chat&utm_medium=app_switcher",
			],
			css: true,
		});
	});
});
