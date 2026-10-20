/**
 * Icons drawn from the brand SVGs (chat, scribe, localman). A product with
 * pre-rendered PNG icons (miu) skips this module and passes its own list to
 * the web manifest.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { BrandConfig } from "../types.js";
import type { ManifestIcon } from "./manifests.js";
import { directoryUrl } from "./paths.js";

/** Which brand asset a raster icon is drawn from. */
export type IconSource = "icon" | "iconMaskable";

/** A PNG the generator draws from a brand SVG into <generated>/icons/. */
export interface RasterIcon {
	/** File name under icons/ and the URL path the web app serves it at. */
	readonly file: string;
	readonly source: IconSource;
	readonly size: number;
}

/**
 * PNG icons of the web app. The rounded icon serves browsers ("any"); the
 * full-bleed maskable icon serves launchers that crop to their own shape and
 * iOS, which rounds the Apple touch icon itself.
 */
export const RASTER_ICONS: readonly RasterIcon[] = [
	{ file: "icon-192.png", source: "icon", size: 192 },
	{ file: "icon-512.png", source: "icon", size: 512 },
	{ file: "icon-maskable-192.png", source: "iconMaskable", size: 192 },
	{ file: "icon-maskable-512.png", source: "iconMaskable", size: 512 },
	{ file: "apple-touch-icon.png", source: "iconMaskable", size: 180 },
];

/** Sizes packed into favicon.ico, for browsers without SVG favicons. */
export const FAVICON_ICO_SIZES: readonly number[] = [16, 32, 48];

export const FAVICON_ICO = "favicon.ico";
/** Default URL path of the SVG favicon (a copy of the brand icon). */
export const DEFAULT_FAVICON_SVG = "icon.svg";
/** Records which brand SVGs the generated icons were drawn from. */
export const ICONS_SOURCE_FILE = "icons-source.json";
/** Directory of the raster icons inside the generated directory. */
export const ICONS_DIR = "icons/";

/** Manifest icons of the SVG favicon and the raster icons, served at the site root. */
export function svgManifestIcons(
	faviconSvg: string = DEFAULT_FAVICON_SVG,
): readonly ManifestIcon[] {
	return [
		{
			src: `/${faviconSvg}`,
			sizes: "any",
			type: "image/svg+xml",
			purpose: "any",
		},
		...RASTER_ICONS.filter((icon) => icon.file.startsWith("icon-")).map(
			(icon) => ({
				src: `/${icon.file}`,
				sizes: `${icon.size}x${icon.size}`,
				type: "image/png",
				purpose: icon.source === "iconMaskable" ? "maskable" : "any",
			}),
		),
	];
}

/** One file the web app serves at the site root, and where it comes from. */
export interface WebIconFile {
	/** URL path without the leading slash. */
	readonly path: string;
	readonly file: URL;
}

export interface WebIconFilesOptions {
	/** Directory the brand config's icon paths are relative to. */
	readonly root: string | URL;
	/** Directory the generator writes to (icons go to its icons/). */
	readonly generatedDir: string | URL;
	readonly faviconSvg?: string;
}

/** Every icon file the web app serves, with its source on disk. */
export function webIconFiles(
	brand: BrandConfig,
	options: WebIconFilesOptions,
): readonly WebIconFile[] {
	const iconsDir = new URL(ICONS_DIR, directoryUrl(options.generatedDir));
	return [
		{
			path: options.faviconSvg ?? DEFAULT_FAVICON_SVG,
			file: new URL(brand.icon, directoryUrl(options.root)),
		},
		{ path: FAVICON_ICO, file: new URL(FAVICON_ICO, iconsDir) },
		...RASTER_ICONS.map((icon) => ({
			path: icon.file,
			file: new URL(icon.file, iconsDir),
		})),
	];
}

/**
 * sha256 of each brand SVG the raster icons come from. The generator stores
 * it next to the icons; a product test compares it with the current files,
 * so an edited logo without regenerating fails instead of shipping stale PNGs.
 */
export function iconSourceHashes(
	brand: BrandConfig,
	root: string | URL,
): Record<IconSource, string> {
	const rootUrl = directoryUrl(root);
	const hash = (file: string) =>
		createHash("sha256")
			.update(readFileSync(new URL(file, rootUrl)))
			.digest("hex");
	return { icon: hash(brand.icon), iconMaskable: hash(brand.iconMaskable) };
}
