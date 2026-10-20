import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { BrandConfig } from "../types.js";
import { encodeIco } from "./ico.js";
import {
	FAVICON_ICO,
	FAVICON_ICO_SIZES,
	ICONS_DIR,
	ICONS_SOURCE_FILE,
	RASTER_ICONS,
	iconSourceHashes,
} from "./icons.js";
import {
	type GenerateManifestsOptions,
	type JsonIndent,
	formatGenerated,
	generateManifests,
} from "./manifests.js";
import { directoryUrl } from "./paths.js";
import type { IconRenderer, RenderRequest } from "./rasterize.js";

export interface WriteBrandFilesOptions {
	readonly brand: BrandConfig;
	/** Directory the brand config's icon paths are relative to. */
	readonly root: string | URL;
	/** Where the manifests go; the icons go to its icons/. */
	readonly generatedDir: string | URL;
	readonly manifests: GenerateManifestsOptions;
	/** JSON indentation of the generated files; default 2 spaces. */
	readonly indent?: JsonIndent;
	/**
	 * Draws the PNG/ICO icons from the brand SVGs. Leave it out when the
	 * product ships pre-rendered icons: then only manifests are written.
	 */
	readonly renderer?: IconRenderer;
}

/**
 * Writes what the platforms derive from the brand: the platform manifests,
 * and with a renderer the PNG icons, favicon.ico and icons-source.json.
 * Everything is generated (and drawn) in memory first, so a failing
 * renderer leaves the directory as it was. Returns the written paths,
 * relative to `generatedDir`.
 */
export async function writeBrandFiles(
	options: WriteBrandFilesOptions,
): Promise<string[]> {
	const { brand, renderer } = options;
	const indent = options.indent ?? 2;
	const files = new Map<string, string | Uint8Array>();
	const manifests = generateManifests(brand, options.manifests);
	for (const [name, content] of Object.entries(manifests)) {
		files.set(name, formatGenerated(content, indent));
	}
	if (renderer !== undefined) {
		for (const [name, content] of await drawIcons(
			brand,
			directoryUrl(options.root),
			renderer,
			indent,
		)) {
			files.set(name, content);
		}
	}

	const outDir = directoryUrl(options.generatedDir);
	mkdirSync(outDir, { recursive: true });
	if (renderer !== undefined) {
		mkdirSync(new URL(ICONS_DIR, outDir), { recursive: true });
	}
	for (const [name, content] of files) {
		writeFileSync(new URL(name, outDir), content);
	}
	return [...files.keys()];
}

/** The icon files by path under the generated directory, drawn in memory. */
async function drawIcons(
	brand: BrandConfig,
	root: URL,
	renderer: IconRenderer,
	indent: JsonIndent,
): Promise<Map<string, string | Uint8Array>> {
	for (const source of [brand.icon, brand.iconMaskable]) {
		if (!source.endsWith(".svg")) {
			throw new Error(
				`brand: ${source} is not an SVG; drop the renderer to ship pre-rendered icons`,
			);
		}
	}
	const svgs = {
		icon: readFileSync(new URL(brand.icon, root)),
		iconMaskable: readFileSync(new URL(brand.iconMaskable, root)),
	};
	const requests: RenderRequest[] = [
		...RASTER_ICONS.map((icon) => ({
			path: brand[icon.source],
			svg: svgs[icon.source],
			size: icon.size,
		})),
		...FAVICON_ICO_SIZES.map((size) => ({
			path: brand.icon,
			svg: svgs.icon,
			size,
		})),
	];
	const pngs = await renderer(requests);
	if (pngs.length !== requests.length) {
		throw new Error(
			`brand: the renderer returned ${pngs.length} images for ${requests.length} requests`,
		);
	}

	const icons = new Map<string, string | Uint8Array>();
	RASTER_ICONS.forEach((icon, index) => {
		const png = pngs[index];
		if (png === undefined) throw new Error(`brand: no image for ${icon.file}`);
		icons.set(`${ICONS_DIR}${icon.file}`, png);
	});
	const icoImages = FAVICON_ICO_SIZES.map((size, index) => {
		const png = pngs[RASTER_ICONS.length + index];
		if (png === undefined) throw new Error(`brand: no ${size}px favicon image`);
		return { size, png };
	});
	icons.set(`${ICONS_DIR}${FAVICON_ICO}`, encodeIco(icoImages));
	icons.set(
		`${ICONS_DIR}${ICONS_SOURCE_FILE}`,
		formatGenerated(iconSourceHashes(brand, root), indent),
	);
	return icons;
}
