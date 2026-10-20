import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	FAVICON_ICO,
	type IconRenderer,
	encodeIco,
	loadBrandConfig,
	svgManifestIcons,
	webIconFiles,
	writeBrandFiles,
} from "../src/build.js";
import {
	PLACEHOLDER,
	consumer,
	decodeIco,
	recordedIconHashes,
} from "./consumers.js";

describe("encodeIco", () => {
	it("packs PNGs into an ICO directory with sizes and offsets", () => {
		const a = new Uint8Array([1, 2, 3]);
		const b = new Uint8Array([4, 5]);
		const ico = encodeIco([
			{ size: 16, png: a },
			{ size: 256, png: b },
		]);
		const view = new DataView(ico.buffer);
		expect(view.getUint16(2, true)).toBe(1);
		expect(view.getUint16(4, true)).toBe(2);
		expect(ico[6]).toBe(16);
		expect(ico[22]).toBe(0); // 256 is written as 0
		expect(view.getUint32(14, true)).toBe(3);
		expect(view.getUint32(18, true)).toBe(38);
		expect(view.getUint32(34, true)).toBe(41);
		expect([...ico.slice(38)]).toEqual([1, 2, 3, 4, 5]);
		expect(() => encodeIco([])).toThrow();
		expect(() => encodeIco([{ size: 300, png: a }])).toThrow(/1..256/);
	});

	it("packs the placeholder favicons into the favicon.ico of the real render", () => {
		const images = [16, 32, 48].map((size) => ({
			size,
			png: new Uint8Array(
				readFileSync(new URL(`renders/icon-${size}.png`, PLACEHOLDER)),
			),
		}));
		const ico = encodeIco(images);
		expect(createHash("sha256").update(ico).digest("hex")).toBe(
			recordedIconHashes()[FAVICON_ICO],
		);
		expect(decodeIco(ico)).toEqual(images);
	});
});

describe("webIconFiles", () => {
	it("serves every icon the manifest lists, the SVG from the brand root", () => {
		const chat = consumer("chat");
		const brand = loadBrandConfig(chat.root);
		const served = webIconFiles(brand, chat);
		expect(served[0]?.file.href).toBe(new URL(brand.icon, chat.root).href);
		expect(existsSync(served[0]?.file ?? "")).toBe(true);
		expect(served.slice(1).map((icon) => icon.file.href)).toEqual(
			served
				.slice(1)
				.map((icon) => new URL(`icons/${icon.path}`, chat.generatedDir).href),
		);
		const paths = new Set(served.map((icon) => `/${icon.path}`));
		for (const icon of svgManifestIcons()) {
			expect(paths.has(icon.src)).toBe(true);
		}
	});

	it("serves the SVG favicon under the product's URL", () => {
		const scribe = consumer("scribe");
		const brand = loadBrandConfig(scribe.root);
		const [svg] = webIconFiles(brand, { ...scribe, faviconSvg: "favicon.svg" });
		expect(svg?.path).toBe("favicon.svg");
		expect(svg?.file.href).toBe(new URL("brand/icon.svg", scribe.root).href);
	});
});

describe("writeBrandFiles", () => {
	const miu = consumer("miu");
	const brand = loadBrandConfig(miu.root);
	const noRender: IconRenderer = async () => [];
	let dir = "";
	const tempDir = (): string => {
		dir = mkdtempSync(path.join(os.tmpdir(), "brand-write-"));
		return dir;
	};
	afterEach(() => {
		if (dir !== "") rmSync(dir, { recursive: true, force: true });
		dir = "";
	});

	it("refuses to rasterize pre-rendered PNG icons, before writing anything", async () => {
		const out = path.join(tempDir(), "generated");
		await expect(
			writeBrandFiles({
				brand,
				root: miu.root,
				generatedDir: out,
				manifests: miu.manifests(brand),
				renderer: noRender,
			}),
		).rejects.toThrow(/not an SVG/);
		expect(existsSync(out)).toBe(false);
	});

	it("writes nothing when the renderer fails", async () => {
		const chat = consumer("chat");
		const chatBrand = loadBrandConfig(chat.root);
		const out = path.join(tempDir(), "generated");
		await expect(
			writeBrandFiles({
				brand: chatBrand,
				root: chat.root,
				generatedDir: out,
				manifests: chat.manifests(chatBrand),
				renderer: async () => {
					throw new Error("chromium crashed");
				},
			}),
		).rejects.toThrow("chromium crashed");
		expect(existsSync(out)).toBe(false);
	});

	it("fails when the renderer returns the wrong number of images", async () => {
		const chat = consumer("chat");
		const chatBrand = loadBrandConfig(chat.root);
		await expect(
			writeBrandFiles({
				brand: chatBrand,
				root: chat.root,
				generatedDir: tempDir(),
				manifests: chat.manifests(chatBrand),
				renderer: noRender,
			}),
		).rejects.toThrow(/returned 0 images for 8 requests/);
	});
});
