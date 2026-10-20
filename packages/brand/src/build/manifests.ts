import type { BrandConfig, ColorKey } from "../types.js";

/** One entry of a web manifest's `icons`. */
export interface ManifestIcon {
	readonly src: string;
	readonly sizes: string;
	readonly type: string;
	readonly purpose: string;
}

/**
 * What differs between the products' web manifests. Optional members are
 * left out of the manifest when not given, so each product keeps the exact
 * manifest it shipped.
 */
export interface WebManifestOptions {
	/** Stable identity across start_url changes (the chat family uses "/"). */
	readonly id?: string;
	readonly lang: string;
	readonly dir?: "ltr" | "rtl" | "auto";
	/** Default "standalone". */
	readonly display?: "fullscreen" | "standalone" | "minimal-ui" | "browser";
	readonly orientation?: string;
	/** Brand colour of theme_color. */
	readonly themeColor: ColorKey;
	/** Brand colour of background_color; default "background". */
	readonly backgroundColor?: ColorKey;
	readonly categories?: readonly string[];
	readonly preferRelatedApplications?: boolean;
	/** Already resolved to the URLs the page serves them at. */
	readonly icons: readonly ManifestIcon[];
}

export interface CapacitorManifestOptions {
	/** Write `urlScheme` (read by the app's deep-link setup); default true. */
	readonly urlScheme?: boolean;
}

export interface GenerateManifestsOptions {
	readonly web: WebManifestOptions;
	/** Generate capacitor.json; `true` uses the defaults. */
	readonly capacitor?: boolean | CapacitorManifestOptions;
}

/**
 * Platform manifests by file name, in the order they are written. There is
 * no tauri.json: desktop is the installable web app (PWA), not a native shell.
 */
export interface GeneratedManifests {
	readonly "web.webmanifest.json": Record<string, unknown>;
	readonly "capacitor.json"?: Record<string, unknown>;
}

function color(brand: BrandConfig, key: ColorKey): string {
	const value = brand.colors[key];
	if (value === undefined) {
		throw new Error(`brand: the web manifest needs colors.${key}`);
	}
	return value;
}

export function webManifest(
	brand: BrandConfig,
	options: WebManifestOptions,
): Record<string, unknown> {
	// Key order is the order of the files the products already ship.
	return {
		...(options.id === undefined ? {} : { id: options.id }),
		name: brand.appName,
		short_name: brand.shortName,
		description: brand.description,
		lang: options.lang,
		...(options.dir === undefined ? {} : { dir: options.dir }),
		start_url: "/",
		scope: "/",
		display: options.display ?? "standalone",
		...(options.orientation === undefined
			? {}
			: { orientation: options.orientation }),
		theme_color: color(brand, options.themeColor),
		background_color: color(brand, options.backgroundColor ?? "background"),
		...(options.categories === undefined
			? {}
			: { categories: [...options.categories] }),
		...(options.preferRelatedApplications === undefined
			? {}
			: { prefer_related_applications: options.preferRelatedApplications }),
		icons: options.icons.map((icon) => ({ ...icon })),
	};
}

/**
 * What capacitor.config.ts spreads. Android is configured when the brand
 * has an Android id. No server.hostname: the WebView keeps its own
 * localhost origin; the production host would make the local server answer
 * the app's API requests and pin one tenant into a binary that serves all.
 */
export function capacitorManifest(
	brand: BrandConfig,
	options: CapacitorManifestOptions = {},
): Record<string, unknown> {
	return {
		appId: brand.appIds.ios,
		appName: brand.appName,
		...(brand.appIds.android === undefined
			? {}
			: { android: { applicationId: brand.appIds.android } }),
		...(options.urlScheme === false ? {} : { urlScheme: brand.urlScheme }),
	};
}

export function generateManifests(
	brand: BrandConfig,
	options: GenerateManifestsOptions,
): GeneratedManifests {
	const capacitor = options.capacitor ?? false;
	return {
		"web.webmanifest.json": webManifest(brand, options.web),
		...(capacitor === false
			? {}
			: {
					"capacitor.json": capacitorManifest(
						brand,
						capacitor === true ? {} : capacitor,
					),
				}),
	};
}

/** Indentation of generated JSON: two spaces, or a tab (Biome repos). */
export type JsonIndent = 2 | "\t";

/** Text of a generated JSON file; the same content always gives the same bytes. */
export function formatGenerated(
	content: unknown,
	indent: JsonIndent = 2,
): string {
	return `${JSON.stringify(content, null, indent)}\n`;
}
