/**
 * Languages of the shared chrome. The app picks the page language and
 * passes it in; the chrome only knows how to say its own words in it.
 */
/**
 * Every language the chrome speaks: Vietnamese first, the ecosystem's main
 * audience, then English and Simplified Chinese (Localman and the account
 * app).
 */
export declare const SHELL_LOCALES: readonly ["vi", "en", "zh-CN"];
export type ShellLocale = (typeof SHELL_LOCALES)[number];
/**
 * The languages of an app that does not say which it has: the two of
 * every app. An app with Chinese passes its own list (e.g. Localman's
 * `["en", "zh-CN", "vi"]`), in the order its switch shows them.
 */
export declare const DEFAULT_SHELL_LOCALES: readonly ["vi", "en"];
export type DefaultShellLocale = (typeof DEFAULT_SHELL_LOCALES)[number];
/** Each language in its own words (endonyms), never translated. */
export declare const SHELL_LOCALE_NAMES: Readonly<Record<ShellLocale, string>>;
export declare function isShellLocale(value: unknown): value is ShellLocale;
/**
 * The language of a BCP 47 tag by its primary subtag ("vi-VN" is vi, "en-GB"
 * is en, any Chinese tag is zh-CN), among the app's `locales`; undefined for
 * any other language. Without `locales` only vi and en match, as in 0.1.
 */
export declare function matchShellLocale(tag: unknown): DefaultShellLocale | undefined;
export declare function matchShellLocale<L extends ShellLocale>(tag: unknown, locales: readonly L[]): L | undefined;
