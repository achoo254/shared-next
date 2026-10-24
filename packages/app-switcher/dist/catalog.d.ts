/**
 * The apps one account signs in to, in the order the switcher lists them.
 * Static on purpose: the IdP has no public catalog API, and the strict CSP
 * of Chat and Scribe blocks requests to it. Chat, Localman and Tunelo run on
 * every tenant (auth-next declares their clients per tenant, chat-clients.ts);
 * Scribe has clients on the primary tenant only (primary-app-clients.ts).
 * Miu World is left out: its players are children.
 */
/** Locales the labels are written in. */
export declare const APP_SWITCHER_LOCALES: readonly ["en", "vi", "zh-CN"];
export type AppSwitcherLocale = (typeof APP_SWITCHER_LOCALES)[number];
/** Apps that show the switcher (the value of `current`). */
export declare const APP_SWITCHER_APP_IDS: readonly ["chat", "scribe", "localman", "tunelo"];
export type AppSwitcherAppId = (typeof APP_SWITCHER_APP_IDS)[number];
/** Every entry of the list: the apps, then the account page. */
export type AppSwitcherEntryId = AppSwitcherAppId | "account";
export type LocalizedText = Readonly<Record<AppSwitcherLocale, string>>;
export interface AppSwitcherCatalogEntry {
    readonly id: AppSwitcherEntryId;
    /** Product name, or what the link does for the account page. */
    readonly label: LocalizedText;
    /** One short line under the label. */
    readonly description: LocalizedText;
    /** Host under the tenant's domain, e.g. `chat.{domain}`. */
    readonly hostTemplate: string;
    /** Path on that host, starting with `/`. */
    readonly path: string;
    /** Listed only for the primary tenant (no host elsewhere yet). */
    readonly primaryTenantOnly: boolean;
}
export declare const APP_SWITCHER_CATALOG: readonly AppSwitcherCatalogEntry[];
