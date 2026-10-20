import { readFileSync } from "node:fs";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import type {
	BrandConfig,
	BrandConfigWith,
	RequirableField,
} from "../types.js";
import { directoryUrl } from "./paths.js";

/** File name of the brand config in a product's brand root. */
export const BRAND_CONFIG_FILE = "brand.config.json";

/** The JSON Schema this package validates brand.config.json against. */
export const BRAND_SCHEMA_URL = new URL(
	"../../brand.config.schema.json",
	import.meta.url,
);

export interface ParseBrandConfigOptions<R extends RequirableField> {
	/**
	 * Optional fields this product cannot work without (for example chat's
	 * "sharedDomains" or "colors.primary"); missing ones fail validation and
	 * the returned type has them as present.
	 */
	readonly require?: readonly R[];
}

let validator: ValidateFunction<BrandConfig> | undefined;

function readJson(url: URL): unknown {
	return JSON.parse(readFileSync(url, "utf8"));
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compiledValidator(): ValidateFunction<BrandConfig> {
	if (validator === undefined) {
		const schema = readJson(BRAND_SCHEMA_URL);
		if (!isObject(schema)) {
			throw new Error("brand.config.schema.json is not a JSON object");
		}
		const ajv = new Ajv2020({ allErrors: true, strict: true });
		validator = ajv.compile<BrandConfig>(schema);
	}
	return validator;
}

function valueAt(root: unknown, dottedPath: string): unknown {
	let current: unknown = root;
	for (const key of dottedPath.split(".")) {
		if (!isObject(current)) return undefined;
		current = current[key];
	}
	return current;
}

function hasFields<R extends RequirableField>(
	brand: BrandConfig,
	fields: readonly R[],
): brand is BrandConfigWith<R> {
	return fields.every((field) => valueAt(brand, field) !== undefined);
}

/**
 * Validates `value` against brand.config.schema.json and returns it typed,
 * or throws with every violation listed (schema errors, then the
 * `require`d fields that are missing).
 */
export function parseBrandConfig<R extends RequirableField = never>(
	value: unknown,
	options: ParseBrandConfigOptions<R> = {},
): BrandConfigWith<R> {
	const validate = compiledValidator();
	if (!validate(value)) {
		const details = (validate.errors ?? [])
			.map((error) => `${error.instancePath || "/"} ${error.message ?? ""}`)
			.join("; ");
		throw new Error(`brand.config.json is invalid: ${details}`);
	}
	const required = options.require ?? [];
	if (!hasFields(value, required)) {
		const missing = required
			.filter((field) => valueAt(value, field) === undefined)
			.map((field) => `/${field.replaceAll(".", "/")} is required here`);
		throw new Error(`brand.config.json is invalid: ${missing.join("; ")}`);
	}
	return value;
}

/** Reads and validates brand.config.json in `root` (a directory). */
export function loadBrandConfig<R extends RequirableField = never>(
	root: string | URL,
	options: ParseBrandConfigOptions<R> = {},
): BrandConfigWith<R> {
	const file = new URL(BRAND_CONFIG_FILE, directoryUrl(root));
	return parseBrandConfig(readJson(file), options);
}
