/** The schema's $defs.domain pattern (a test keeps the two equal). */
export const DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
function fill(template, domain) {
    if (!DOMAIN_PATTERN.test(domain)) {
        throw new Error(`brand: "${domain}" is not a root domain`);
    }
    // A function replacement: "$&" or "$1" in the domain stay literal text.
    return template.replace("{domain}", () => domain);
}
/** Throws when `domain` is not a lowercase registrable domain (no port, no path). */
export function hostsFor(brand, domain) {
    const web = fill(brand.hostTemplates.web, domain);
    return { web, webOrigin: `https://${web}` };
}
/** `https://<web host>` under `primaryTenant.domain`. */
export function primaryOrigin(brand) {
    return hostsFor(brand, brand.primaryTenant.domain).webOrigin;
}
/**
 * Origin of one Mini App (bot `botId`) on the shared Mini App domain, never
 * under the product's own domain. Throws when the brand has no sharedDomains.
 */
export function miniAppOrigin(brand, botId) {
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
 * accepts under `domain`; development builds also accept `devOrigins`.
 */
export function allowedOrigins(brand, domain, development) {
    const origins = [hostsFor(brand, domain).webOrigin];
    return development ? [...origins, ...(brand.devOrigins ?? [])] : origins;
}
