/**
 * Languages of the shared chrome. The app picks the page language and
 * passes it in; the chrome only knows how to say its own words in it.
 */
/** In switch order: Vietnamese first, the ecosystem's main audience. */
export declare const SHELL_LOCALES: readonly ["vi", "en"];
export type ShellLocale = (typeof SHELL_LOCALES)[number];
/** Each language in its own words (endonyms), never translated. */
export declare const SHELL_LOCALE_NAMES: Readonly<Record<ShellLocale, string>>;
export declare function isShellLocale(value: unknown): value is ShellLocale;
/**
 * The shell locale of a BCP 47 tag by its primary language ("vi-VN" is vi,
 * "en-GB" is en), or undefined for any other language.
 */
export declare function matchShellLocale(tag: unknown): ShellLocale | undefined;
