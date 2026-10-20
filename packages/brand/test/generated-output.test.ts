/**
 * Each product's options reproduce its committed manifests byte for byte
 * (fixtures/<product>/generated, copied from the product repositories). The
 * fixtures hold neutral placeholder icons instead of the product logos, so
 * icons-source.json is the one generated from the placeholders, and the
 * PNG/ICO files are compared with the sha256 recorded from a real Chromium
 * render of the placeholders (fixtures/placeholder/icons.sha256.json). The
 * products prove the same with their real logos in their own repositories.
 */
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
	FAVICON_ICO,
	FAVICON_ICO_SIZES,
	ICONS_DIR,
	ICONS_SOURCE_FILE,
	RASTER_ICONS,
	type RenderRequest,
	formatGenerated,
	generateManifests,
	loadBrandConfig,
	writeBrandFiles,
} from "../src/build.js";
import {
	CONSUMERS,
	PLACEHOLDER,
	filesUnder,
	placeholderRenderer,
	recordedIconHashes,
} from "./consumers.js";

const sha256 = (bytes: Uint8Array): string =>
	createHash("sha256").update(bytes).digest("hex");

/** Raster icon and favicon files the generator writes, under icons/. */
const DRAWN_FILES = [...RASTER_ICONS.map((icon) => icon.file), FAVICON_ICO];

describe.each(CONSUMERS)("$name", (consumer) => {
	let outDir = "";
	afterEach(() => {
		if (outDir !== "") rmSync(outDir, { recursive: true, force: true });
		outDir = "";
	});

	const brand = loadBrandConfig(consumer.root, { require: consumer.require });

	it("generates manifests equal to the committed ones", () => {
		const manifests = generateManifests(brand, consumer.manifests(brand));
		for (const [name, content] of Object.entries(manifests)) {
			const committed = readFileSync(
				new URL(name, consumer.generatedDir),
				"utf8",
			);
			expect(formatGenerated(content, consumer.indent), name).toBe(committed);
		}
	});

	it("writes the generated directory: committed files byte for byte, drawn icons by recorded hash", async () => {
		outDir = mkdtempSync(path.join(os.tmpdir(), `brand-${consumer.name}-`));
		const seen: RenderRequest[] = [];
		const written = await writeBrandFiles({
			brand,
			root: consumer.root,
			generatedDir: outDir,
			manifests: consumer.manifests(brand),
			indent: consumer.indent,
			...(consumer.rastersIcons ? { renderer: placeholderRenderer(seen) } : {}),
		});

		const committed = filesUnder(consumer.generatedDir);
		const drawn = consumer.rastersIcons
			? DRAWN_FILES.map((file) => `${ICONS_DIR}${file}`)
			: [];
		expect([...written].sort()).toEqual([...committed, ...drawn].sort());
		expect(filesUnder(pathToFileURL(`${outDir}/`))).toEqual(
			[...written].sort(),
		);
		for (const file of committed) {
			const actual = readFileSync(path.join(outDir, file));
			const expected = readFileSync(new URL(file, consumer.generatedDir));
			expect(Buffer.compare(actual, expected), file).toBe(0);
		}
		if (!consumer.rastersIcons) {
			expect(seen).toEqual([]);
			return;
		}

		const recorded = recordedIconHashes();
		for (const file of DRAWN_FILES) {
			const bytes = readFileSync(path.join(outDir, ICONS_DIR, file));
			expect(sha256(bytes), file).toBe(recorded[file]);
		}
		// Each raster icon and favicon size was drawn from the right SVG.
		expect(seen.map((request) => [request.path, request.size])).toEqual([
			...RASTER_ICONS.map((icon) => [brand[icon.source], icon.size]),
			...FAVICON_ICO_SIZES.map((size) => [brand.icon, size]),
		]);
		expect(committed).toContain(`${ICONS_DIR}${ICONS_SOURCE_FILE}`);
	});
});

describe("placeholder icons", () => {
	it("are the art the fixtures' SVG paths hold", () => {
		for (const name of ["chat", "scribe", "localman"] as const) {
			const consumer = CONSUMERS.find((c) => c.name === name);
			if (consumer === undefined) throw new Error(name);
			const brand = loadBrandConfig(consumer.root);
			for (const [source, file] of [
				["icon.svg", brand.icon],
				["icon-maskable.svg", brand.iconMaskable],
			] as const) {
				expect(
					Buffer.compare(
						readFileSync(new URL(file, consumer.root)),
						readFileSync(new URL(source, PLACEHOLDER)),
					),
					`${name} ${file}`,
				).toBe(0);
			}
		}
	});

	it("renders match the recorded hashes of the real Chromium run", () => {
		const recorded = recordedIconHashes();
		const renders: Record<string, string> = {
			"icon-192.png": "icon-192",
			"icon-512.png": "icon-512",
			"icon-maskable-192.png": "icon-maskable-192",
			"icon-maskable-512.png": "icon-maskable-512",
			"apple-touch-icon.png": "icon-maskable-180",
		};
		for (const [file, render] of Object.entries(renders)) {
			const bytes = readFileSync(new URL(`renders/${render}.png`, PLACEHOLDER));
			expect(sha256(bytes), file).toBe(recorded[file]);
		}
		expect(Object.keys(recorded).sort()).toEqual([...DRAWN_FILES].sort());
	});
});
