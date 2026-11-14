/**
 * The apps one account signs in to, in the order the switcher lists them.
 * Static on purpose: the IdP has no public catalog API, and the strict CSP
 * of Chat and Scribe blocks requests to it. Every app lives under the same
 * root domain, given by the caller. Entries come in three groups, Tools,
 * Entertainment and Learning, each under its own heading. Tử Vi, Miu
 * World, Web Nhanh and Tiểu Đệ are listed but do not show the switcher
 * themselves. Knowledge Base (`kb`) is a main app: it can pass itself as
 * `current` once it shows the switcher.
 */
/** Locales the labels are written in. */
export declare const APP_SWITCHER_LOCALES: readonly ["en", "vi", "zh-CN"];
export type AppSwitcherLocale = (typeof APP_SWITCHER_LOCALES)[number];
/** Apps that show the switcher (the value of `current`). */
export declare const APP_SWITCHER_APP_IDS: readonly ["chat", "kb", "scribe", "localman", "tunelo"];
export type AppSwitcherAppId = (typeof APP_SWITCHER_APP_IDS)[number];
/** Every entry of the list: the apps by group, then the account page. */
export type AppSwitcherEntryId = AppSwitcherAppId | "tuvi" | "miu" | "webnhanh" | "clip" | "truyen" | "lockin" | "tieude" | "account";
/** The three kinds of app, in the order the switcher lists them. */
export declare const APP_SWITCHER_GROUPS: readonly ["tools", "fun", "learn"];
export type AppSwitcherGroup = (typeof APP_SWITCHER_GROUPS)[number];
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
    /** The group heading it is listed under; the account page has none. */
    readonly group?: AppSwitcherGroup;
}
export declare const APP_SWITCHER_CATALOG: readonly AppSwitcherCatalogEntry[];
