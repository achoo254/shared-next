import { type AppSwitcherAppId, type AppSwitcherEntryId, type AppSwitcherLocale } from "./catalog.js";
/** `utm_medium` of every switcher link. */
export declare const APP_SWITCHER_UTM_MEDIUM = "app_switcher";
export interface AppSwitcherLinksOptions {
    /** The app showing the switcher: left out of the list, sent as `utm_source`. */
    readonly current: AppSwitcherAppId;
    /** The tenant's root domain, e.g. `hoandat.com` (no port, no path). */
    readonly tenantDomain: string;
    /** Chat and Scribe are listed only for the primary tenant. */
    readonly isPrimaryTenant: boolean;
    readonly locale: AppSwitcherLocale;
}
export interface AppSwitcherLink {
    readonly id: AppSwitcherEntryId;
    readonly label: string;
    readonly description: string;
    /** Absolute https URL carrying `utm_source` and `utm_medium`. */
    readonly href: string;
}
/** `locale` when the catalog has it, else English (labels never go missing). */
export declare function resolveAppSwitcherLocale(locale: string): AppSwitcherLocale;
/**
 * Links to the other apps of the tenant, then the account page, in catalog
 * order. Throws when `current` is not a catalog app or `tenantDomain` is not
 * a lowercase registrable domain (the IdP's domain rule).
 */
export declare function appSwitcherLinks(options: AppSwitcherLinksOptions): AppSwitcherLink[];
