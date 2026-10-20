/**
 * Build-time entry (Node only): validates brand.config.json against the
 * schema and derives the platform manifests and icons from it. Nothing here
 * belongs in a browser bundle.
 */
export { BRAND_CONFIG_FILE, BRAND_SCHEMA_URL, type ParseBrandConfigOptions, loadBrandConfig, parseBrandConfig, } from "./build/config.js";
export { type IcoImage, encodeIco } from "./build/ico.js";
export { DEFAULT_FAVICON_SVG, FAVICON_ICO, FAVICON_ICO_SIZES, ICONS_DIR, ICONS_SOURCE_FILE, type IconSource, RASTER_ICONS, type RasterIcon, type WebIconFile, type WebIconFilesOptions, iconSourceHashes, svgManifestIcons, webIconFiles, } from "./build/icons.js";
export { type CapacitorManifestOptions, type GenerateManifestsOptions, type GeneratedManifests, type JsonIndent, type ManifestIcon, type WebManifestOptions, capacitorManifest, formatGenerated, generateManifests, webManifest, } from "./build/manifests.js";
export { type ChromiumLauncher, type ChromiumPage, type IconRenderer, type RenderRequest, chromiumRenderer, } from "./build/rasterize.js";
export { type WriteBrandFilesOptions, writeBrandFiles, } from "./build/write-brand-files.js";
export type * from "./types.js";
