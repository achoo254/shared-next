/**
 * Build-time entry (Node only): validates brand.config.json against the
 * schema and derives the platform manifests and icons from it. Nothing here
 * belongs in a browser bundle.
 */
export { BRAND_CONFIG_FILE, BRAND_SCHEMA_URL, loadBrandConfig, parseBrandConfig, } from "./build/config.js";
export { encodeIco } from "./build/ico.js";
export { DEFAULT_FAVICON_SVG, FAVICON_ICO, FAVICON_ICO_SIZES, ICONS_DIR, ICONS_SOURCE_FILE, RASTER_ICONS, iconSourceHashes, svgManifestIcons, webIconFiles, } from "./build/icons.js";
export { capacitorManifest, formatGenerated, generateManifests, webManifest, } from "./build/manifests.js";
export { chromiumRenderer, } from "./build/rasterize.js";
export { writeBrandFiles, } from "./build/write-brand-files.js";
