/**
 * Hosts a tenant serves the product from, derived from hostTemplates and
 * sharedDomains. Browser-safe. Product-specific paths on the web host (a
 * Bot API, webhooks) stay in the product: they are routes, not brand.
 */
import type { BrandConfig } from "./types.js";

type HostsBrand = Pick<BrandConfig, "hostTemplates">;

/** The hosts one tenant serves the product from. */
export interface TenantHosts {
	/** Host of the web app, e.g. chat.<domain>. */
	readonly web: string;
	/** `https://<web>`. */
	readonly webOrigin: string;
}

/** The schema's $defs.domain pattern (a test keeps the two equal). */
export const DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

function fill(template: string, domain: string): string {
	if (!DOMAIN_PATTERN.test(domain)) {
		throw new Error(`brand: "${domain}" is not a tenant domain`);
	}
	// A function replacement: "$&" or "$1" in the domain stay literal text.
	return template.replace("{domain}", () => domain);
}

/** Throws when `domain` is not a lowercase registrable domain (no port, no path). */
export function hostsFor(brand: HostsBrand, domain: string): TenantHosts {
	const web = fill(brand.hostTemplates.web, domain);
	return { web, webOrigin: `https://${web}` };
}

/** `https://<web host>` of the primary tenant. */
export function primaryOrigin(
	brand: HostsBrand & Pick<BrandConfig, "primaryTenant">,
): string {
	return hostsFor(brand, brand.primaryTenant.domain).webOrigin;
}

/**
 * Origin of one Mini App (bot `botId`) on the shared Mini App domain, never
 * under a tenant's domain. Throws when the brand has no sharedDomains.
 */
export function miniAppOrigin(
	brand: Pick<BrandConfig, "sharedDomains">,
	botId: number,
): string {
	if (brand.sharedDomains === undefined) {
		throw new Error("brand: miniAppOrigin needs sharedDomains.miniApp");
	}
	if (!Number.isSafeInteger(botId) || botId < 0) {
		throw new Error(`brand: bot id ${botId} is not a non-negative integer`);
	}
	return `https://b${botId}.${brand.sharedDomains.miniApp}`;
}

/**
 * Origins whose state-changing requests and WebSocket handshakes the product
 * accepts for a tenant; development builds also accept `devOrigins`.
 */
export function allowedOrigins(
	brand: HostsBrand & Pick<BrandConfig, "devOrigins">,
	domain: string,
	development: boolean,
): string[] {
	const origins = [hostsFor(brand, domain).webOrigin];
	return development ? [...origins, ...(brand.devOrigins ?? [])] : origins;
}
