/**
 * The built package, loaded the way consumers load it: plain Node resolving
 * `@shared-next/brand/...` through package.json `exports` (no tsx, no Vite).
 * CI rebuilds dist/ before this and fails when it differs from the commit.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as srcBuild from "../src/build.js";
import * as srcCheckBrand from "../src/check-brand.js";
import * as srcHosts from "../src/hosts.js";
import * as srcIndex from "../src/index.js";

const PACKAGE_DIR = fileURLToPath(new URL("../", import.meta.url));
const DIST = new URL("../dist/", import.meta.url);

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
		for (const entry of ["index", "hosts", "build", "check-brand"]) {
			expect(existsSync(new URL(`${entry}.js`, DIST)), entry).toBe(true);
			expect(existsSync(new URL(`${entry}.d.ts`, DIST)), entry).toBe(true);
		}
	});

	it("exports through package.json exactly what the sources export", () => {
		const loaded: Record<string, string[]> = JSON.parse(
			node(`
				const entries = ["", "/hosts", "/build", "/check-brand"];
				const out = {};
				for (const entry of entries) {
					out[entry] = Object.keys(await import("@shared-next/brand" + entry)).sort();
				}
				process.stdout.write(JSON.stringify(out));
			`),
		);
		expect(loaded).toEqual({
			"": Object.keys(srcIndex).sort(),
			"/hosts": Object.keys(srcHosts).sort(),
			"/build": Object.keys(srcBuild).sort(),
			"/check-brand": Object.keys(srcCheckBrand).sort(),
		});
	});

	it("validates a config and generates chat's committed manifests", () => {
		const fixture = new URL("fixtures/chat/", import.meta.url).href;
		const output = node(`
			import { formatGenerated, generateManifests, loadBrandConfig, svgManifestIcons } from "@shared-next/brand/build";
			const brand = loadBrandConfig(new URL(${JSON.stringify(fixture)}), { require: ["colors.primary"] });
			const manifests = generateManifests(brand, {
				web: { id: "/", lang: "vi", dir: "ltr", themeColor: "primary", categories: ["social"], preferRelatedApplications: false, icons: svgManifestIcons() },
				capacitor: true,
			});
			process.stdout.write(JSON.stringify(Object.fromEntries(
				Object.entries(manifests).map(([name, content]) => [name, formatGenerated(content)]),
			)));
		`);
		const manifests: Record<string, string> = JSON.parse(output);
		expect(Object.keys(manifests)).toEqual([
			"web.webmanifest.json",
			"capacitor.json",
		]);
		for (const [name, text] of Object.entries(manifests)) {
			expect(text, name).toBe(
				readFileSync(
					new URL(`fixtures/chat/generated/${name}`, import.meta.url),
					"utf8",
				),
			);
		}
	});

	it("runs the check-brand bin with plain node", () => {
		const bin = fileURLToPath(new URL("check-brand/bin.js", DIST));
		expect(readFileSync(bin, "utf8").startsWith("#!/usr/bin/env node\n")).toBe(
			true,
		);
		const usage = execFileSync(process.execPath, [bin, "--help"], {
			encoding: "utf8",
		});
		expect(usage).toMatch(/^Usage: check-brand/);
	});

	it("keeps the browser entries free of Node built-ins and packages", () => {
		const seen = new Set<string>();
		const visit = (file: URL): void => {
			if (seen.has(file.href)) return;
			seen.add(file.href);
			const code = readFileSync(file, "utf8");
			for (const match of code.matchAll(/(?:from|import)\s*\(?\s*"([^"]+)"/g)) {
				const specifier = match[1] ?? "";
				expect(
					specifier.startsWith("."),
					`${file.pathname}: ${specifier}`,
				).toBe(true);
				visit(new URL(specifier, file));
			}
		};
		visit(new URL("index.js", DIST));
		visit(new URL("hosts.js", DIST));
		expect(
			[...seen].map((href) => href.slice(DIST.href.length)).sort(),
		).toEqual(["define-brand.js", "hosts.js", "index.js"]);
	});
});
