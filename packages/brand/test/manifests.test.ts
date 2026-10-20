import { describe, expect, it } from "vitest";
import {
	capacitorManifest,
	formatGenerated,
	generateManifests,
	loadBrandConfig,
	svgManifestIcons,
	webManifest,
} from "../src/build.js";
import { CONSUMERS, consumer } from "./consumers.js";

const scribe = loadBrandConfig(consumer("scribe").root);

describe.each(CONSUMERS)("$name manifests", (c) => {
	const brand = loadBrandConfig(c.root);

	it("follow the brand, so renaming means editing brand.config.json only", () => {
		const renamed = { ...brand, appName: "Renamed", shortName: "Ren" };
		const manifests = generateManifests(renamed, c.manifests(renamed));
		expect(manifests["web.webmanifest.json"]).toMatchObject({
			name: "Renamed",
			short_name: "Ren",
		});
		expect(manifests["capacitor.json"]).toMatchObject({ appName: "Renamed" });
	});

	it("keep the Capacitor WebView on its own origin, not a tenant's host", () => {
		const manifests = generateManifests(brand, c.manifests(brand));
		expect(manifests["capacitor.json"]).not.toHaveProperty("server");
	});
});

describe("manifest options", () => {
	it("leave Android out for an iOS-only product, and never write tauri.json", () => {
		expect(capacitorManifest(scribe)).toEqual({
			appId: "com.hoandat.scribe",
			appName: "Scribe",
			urlScheme: "com.hoandat.scribe",
		});
		expect(
			Object.keys(
				generateManifests(scribe, {
					web: { lang: "vi", themeColor: "background", icons: [] },
				}),
			),
		).toEqual(["web.webmanifest.json"]);
	});

	it("fail on a theme colour the brand does not have", () => {
		expect(() =>
			webManifest(scribe, { lang: "vi", themeColor: "theme", icons: [] }),
		).toThrow("brand: the web manifest needs colors.theme");
	});

	it("list the SVG favicon under the URL the product serves it at", () => {
		expect(svgManifestIcons()[0]?.src).toBe("/icon.svg");
		expect(svgManifestIcons("favicon.svg")[0]?.src).toBe("/favicon.svg");
		expect(svgManifestIcons().map((icon) => icon.purpose)).toEqual([
			"any",
			"any",
			"any",
			"maskable",
			"maskable",
		]);
	});

	it("format generated JSON with two spaces or a tab and a final newline", () => {
		expect(formatGenerated({ a: [1] })).toBe('{\n  "a": [\n    1\n  ]\n}\n');
		expect(formatGenerated({ a: 1 }, "\t")).toBe('{\n\t"a": 1\n}\n');
	});
});
