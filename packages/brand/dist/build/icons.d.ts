import type { BrandConfig } from "../types.js";
import type { ManifestIcon } from "./manifests.js";
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
export declare const RASTER_ICONS: readonly RasterIcon[];
/** Sizes packed into favicon.ico, for browsers without SVG favicons. */
export declare const FAVICON_ICO_SIZES: readonly number[];
export declare const FAVICON_ICO = "favicon.ico";
/** Default URL path of the SVG favicon (a copy of the brand icon). */
export declare const DEFAULT_FAVICON_SVG = "icon.svg";
/** Records which brand SVGs the generated icons were drawn from. */
export declare const ICONS_SOURCE_FILE = "icons-source.json";
/** Directory of the raster icons inside the generated directory. */
export declare const ICONS_DIR = "icons/";
/** Manifest icons of the SVG favicon and the raster icons, served at the site root. */
export declare function svgManifestIcons(faviconSvg?: string): readonly ManifestIcon[];
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
export declare function webIconFiles(brand: BrandConfig, options: WebIconFilesOptions): readonly WebIconFile[];
/**
 * sha256 of each brand SVG the raster icons come from. The generator stores
 * it next to the icons; a product test compares it with the current files,
 * so an edited logo without regenerating fails instead of shipping stale PNGs.
 */
export declare function iconSourceHashes(brand: BrandConfig, root: string | URL): Record<IconSource, string>;
