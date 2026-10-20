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
export declare const DOMAIN_PATTERN: RegExp;
/** Throws when `domain` is not a lowercase registrable domain (no port, no path). */
export declare function hostsFor(brand: HostsBrand, domain: string): TenantHosts;
/** `https://<web host>` of the primary tenant. */
export declare function primaryOrigin(brand: HostsBrand & Pick<BrandConfig, "primaryTenant">): string;
/**
 * Origin of one Mini App (bot `botId`) on the shared Mini App domain, never
 * under a tenant's domain. Throws when the brand has no sharedDomains.
 */
export declare function miniAppOrigin(brand: Pick<BrandConfig, "sharedDomains">, botId: number): string;
/**
 * Origins whose state-changing requests and WebSocket handshakes the product
 * accepts for a tenant; development builds also accept `devOrigins`.
 */
export declare function allowedOrigins(brand: HostsBrand & Pick<BrandConfig, "devOrigins">, domain: string, development: boolean): string[];
export {};
