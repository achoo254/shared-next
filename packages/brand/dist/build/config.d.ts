import type { BrandConfigWith, RequirableField } from "../types.js";
/** File name of the brand config in a product's brand root. */
export declare const BRAND_CONFIG_FILE = "brand.config.json";
/** The JSON Schema this package validates brand.config.json against. */
export declare const BRAND_SCHEMA_URL: import("url").URL;
export interface ParseBrandConfigOptions<R extends RequirableField> {
    /**
     * Optional fields this product cannot work without (for example chat's
     * "sharedDomains" or "colors.primary"); missing ones fail validation and
     * the returned type has them as present.
     */
    readonly require?: readonly R[];
}
/**
 * Validates `value` against brand.config.schema.json and returns it typed,
 * or throws with every violation listed (schema errors, then the
 * `require`d fields that are missing).
 */
export declare function parseBrandConfig<R extends RequirableField = never>(value: unknown, options?: ParseBrandConfigOptions<R>): BrandConfigWith<R>;
/** Reads and validates brand.config.json in `root` (a directory). */
export declare function loadBrandConfig<R extends RequirableField = never>(root: string | URL, options?: ParseBrandConfigOptions<R>): BrandConfigWith<R>;
