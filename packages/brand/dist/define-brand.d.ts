import type { BrandConfig } from "./types.js";
/**
 * The brand of a bundle (web UI, server bundle, Vite config): `config` is
 * brand.config.json imported as a module, returned with its own precise
 * type. It checks only that the required fields are non-empty strings;
 * the full schema needs Ajv, which compiles validators with `new Function`
 * (blocked by a strict CSP), so it runs at build time instead through
 * `parseBrandConfig` of `@achoo254/brand/build`.
 */
export declare function defineBrand<T extends BrandConfig>(config: T): T;
