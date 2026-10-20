/**
 * Icons drawn from the brand SVGs (chat, scribe, localman). A product with
 * pre-rendered PNG icons (miu) skips this module and passes its own list to
 * the web manifest.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { directoryUrl } from "./paths.js";
/**
 * PNG icons of the web app. The rounded icon serves browsers ("any"); the
 * full-bleed maskable icon serves launchers that crop to their own shape and
 * iOS, which rounds the Apple touch icon itself.
 */
export const RASTER_ICONS = [
    { file: "icon-192.png", source: "icon", size: 192 },
    { file: "icon-512.png", source: "icon", size: 512 },
    { file: "icon-maskable-192.png", source: "iconMaskable", size: 192 },
    { file: "icon-maskable-512.png", source: "iconMaskable", size: 512 },
    { file: "apple-touch-icon.png", source: "iconMaskable", size: 180 },
];
/** Sizes packed into favicon.ico, for browsers without SVG favicons. */
export const FAVICON_ICO_SIZES = [16, 32, 48];
export const FAVICON_ICO = "favicon.ico";
/** Default URL path of the SVG favicon (a copy of the brand icon). */
export const DEFAULT_FAVICON_SVG = "icon.svg";
/** Records which brand SVGs the generated icons were drawn from. */
export const ICONS_SOURCE_FILE = "icons-source.json";
/** Directory of the raster icons inside the generated directory. */
export const ICONS_DIR = "icons/";
/** Manifest icons of the SVG favicon and the raster icons, served at the site root. */
export function svgManifestIcons(faviconSvg = DEFAULT_FAVICON_SVG) {
    return [
        {
            src: `/${faviconSvg}`,
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
        },
        ...RASTER_ICONS.filter((icon) => icon.file.startsWith("icon-")).map((icon) => ({
            src: `/${icon.file}`,
            sizes: `${icon.size}x${icon.size}`,
            type: "image/png",
            purpose: icon.source === "iconMaskable" ? "maskable" : "any",
        })),
    ];
}
/** Every icon file the web app serves, with its source on disk. */
export function webIconFiles(brand, options) {
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
export function iconSourceHashes(brand, root) {
    const rootUrl = directoryUrl(root);
    const hash = (file) => createHash("sha256")
        .update(readFileSync(new URL(file, rootUrl)))
        .digest("hex");
    return { icon: hash(brand.icon), iconMaskable: hash(brand.iconMaskable) };
}
