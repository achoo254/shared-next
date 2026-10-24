/**
 * Browser-safe entry: the brand config types and `defineBrand`, which gives
 * a bundle its brand from the imported brand.config.json. No Node built-ins
 * and no schema validator, so it runs in the web UI and in bundled servers.
 *
 * - `@achoo254/brand/hosts`: product hosts and allowed origins (browser-safe).
 * - `@achoo254/brand/build`: schema validation, manifest and icon
 *   generation (Node only).
 * - `@achoo254/brand/check-brand`: the hard-coded product name check
 *   (Node only).
 */
export { defineBrand } from "./define-brand.js";
export type {
	BrandAppIds,
	BrandColors,
	BrandConfig,
	BrandConfigWith,
	ColorKey,
	RequirableField,
} from "./types.js";
