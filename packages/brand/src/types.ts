/**
 * brand.config.json, as described by brand.config.schema.json. The fields
 * every product has are required; the ones only some products use are
 * optional, and a product makes its own ones mandatory with
 * `parseBrandConfig(value, { require: [...] })` (see RequirableField).
 */
export interface BrandConfig {
	readonly appName: string;
	readonly shortName: string;
	readonly description: string;
	readonly colors: BrandColors;
	/** Master icon, relative to the product's brand root (SVG or PNG). */
	readonly icon: string;
	/** Full-bleed icon for maskable manifest icons and the Apple touch icon. */
	readonly iconMaskable: string;
	/** Whether the web app is installable (manifest and icons linked). */
	readonly webInstall?: boolean;
	readonly appIds: BrandAppIds;
	/** Private-use URI scheme (RFC 8252) of deep links and the OIDC redirect. */
	readonly urlScheme: string;
	readonly primaryTenant: {
		readonly domain: string;
		readonly issuer: string;
	};
	/** Hosts of one tenant; `{domain}` is the tenant's domain. */
	readonly hostTemplates: {
		readonly web: string;
	};
	/** Domains shared by every tenant, never under a tenant's domain. */
	readonly sharedDomains?: {
		readonly media: string;
		readonly miniApp: string;
	};
	/** Extra origins accepted only by development builds. */
	readonly devOrigins?: readonly string[];
	/** Title of push notifications that hide the message. */
	readonly pushSenderName?: string;
}

export interface BrandColors {
	/** Accent colour (the primary button). */
	readonly primary?: string;
	/** Dedicated browser toolbar colour, for products without an accent. */
	readonly theme?: string;
	/** Light page background; the splash behind a loading installed app. */
	readonly background: string;
	/** Dark page background. */
	readonly backgroundDark?: string;
}

/** Capacitor bundle ids. Desktop is the installable web app (PWA), so it has none. */
export interface BrandAppIds {
	readonly ios: string;
	readonly android?: string;
}

/** A colour of BrandColors, by name. */
export type ColorKey = keyof BrandColors;

/** Optional fields a product can make mandatory when it parses its config. */
export type RequirableField =
	| "webInstall"
	| "sharedDomains"
	| "devOrigins"
	| "pushSenderName"
	| "appIds.android"
	| "colors.primary"
	| "colors.theme"
	| "colors.backgroundDark";

type TopLevel<R extends RequirableField> = Extract<R, keyof BrandConfig>;
type Nested<
	R extends RequirableField,
	Parent extends string,
> = R extends `${Parent}.${infer Key}` ? Key : never;

type Present<T, K extends keyof T> = {
	readonly [P in K]-?: Exclude<T[P], undefined>;
};

/** BrandConfig with the fields `R` names known to be present. */
export type BrandConfigWith<R extends RequirableField> = BrandConfig &
	Present<BrandConfig, TopLevel<R>> & {
		readonly colors: BrandColors &
			Present<BrandColors, Extract<Nested<R, "colors">, keyof BrandColors>>;
		readonly appIds: BrandAppIds &
			Present<BrandAppIds, Extract<Nested<R, "appIds">, keyof BrandAppIds>>;
	};
