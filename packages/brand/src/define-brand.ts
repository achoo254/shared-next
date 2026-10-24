import type { BrandConfig } from "./types.js";

/** Required string fields, as dotted paths into the config. */
const REQUIRED_STRINGS = [
	"appName",
	"shortName",
	"description",
	"colors.background",
	"icon",
	"iconMaskable",
	"appIds.ios",
	"urlScheme",
	"primaryTenant.domain",
	"primaryTenant.issuer",
	"hostTemplates.web",
] as const;

function valueAt(root: unknown, path: string): unknown {
	let current: unknown = root;
	for (const key of path.split(".")) {
		if (typeof current !== "object" || current === null) return undefined;
		current = Reflect.get(current, key);
	}
	return current;
}

/**
 * The brand of a bundle (web UI, server bundle, Vite config): `config` is
 * brand.config.json imported as a module, returned with its own precise
 * type. It checks only that the required fields are non-empty strings;
 * the full schema needs Ajv, which compiles validators with `new Function`
 * (blocked by a strict CSP), so it runs at build time instead through
 * `parseBrandConfig` of `@achoo254/brand/build`.
 */
export function defineBrand<T extends BrandConfig>(config: T): T {
	const missing = REQUIRED_STRINGS.filter((path) => {
		const value = valueAt(config, path);
		return typeof value !== "string" || value === "";
	});
	if (missing.length > 0) {
		throw new Error(
			`brand.config.json is invalid: missing or empty ${missing.join(", ")}`,
		);
	}
	if (!config.hostTemplates.web.includes("{domain}")) {
		throw new Error(
			"brand.config.json is invalid: hostTemplates.web has no {domain}",
		);
	}
	return config;
}
