/**
 * The apps one account signs in to, in the order the switcher lists them.
 * Static on purpose: the IdP has no public catalog API, and the strict CSP
 * of Chat and Scribe blocks requests to it. Every app lives under the same
 * root domain, given by the caller. The apps people come back to lead the
 * list; the developer tools follow under their own heading. Tử Vi, Miu
 * World, Web Nhanh and Tiểu Đệ are listed but do not show the switcher
 * themselves.
 */
/** Locales the labels are written in. */
export declare const APP_SWITCHER_LOCALES: readonly ["en", "vi", "zh-CN"];
export type AppSwitcherLocale = (typeof APP_SWITCHER_LOCALES)[number];
/** Apps that show the switcher (the value of `current`). */
export declare const APP_SWITCHER_APP_IDS: readonly ["chat", "scribe", "localman", "tunelo"];
export type AppSwitcherAppId = (typeof APP_SWITCHER_APP_IDS)[number];
/** Every entry of the list: the apps, the developer tools, then the account page. */
export type AppSwitcherEntryId = AppSwitcherAppId | "tuvi" | "miu" | "webnhanh" | "tieude" | "account";
export type LocalizedText = Readonly<Record<AppSwitcherLocale, string>>;
export interface AppSwitcherCatalogEntry {
    readonly id: AppSwitcherEntryId;
    /** Product name, or what the link does for the account page. */
    readonly label: LocalizedText;
    /** One short line under the label. */
    readonly description: LocalizedText;
    /** Host under the root domain, e.g. `chat.{domain}`. */
    readonly hostTemplate: string;
    /** Path on that host, starting with `/`. */
    readonly path: string;
    /** Listed under the developer tools heading. */
    readonly developer?: true;
}
export declare const APP_SWITCHER_CATALOG: readonly AppSwitcherCatalogEntry[];
