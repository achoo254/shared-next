import { type ShellLocale } from "./locale.js";
export type ThemePreference = "light" | "dark" | "system";
export declare const THEME_PREFERENCES: readonly ThemePreference[];
/** Cookie (and storage key) of each preference; auth-next reads `hd_lang` too. */
export declare const PREFERENCE_KEYS: {
    readonly lang: "hd_lang";
    readonly theme: "hd_theme";
};
export type PreferenceName = keyof typeof PREFERENCE_KEYS;
export interface PreferenceValues {
    readonly lang: ShellLocale;
    readonly theme: ThemePreference;
}
export interface Preferences {
    /** Undefined until someone picks a language: the app chooses its default. */
    readonly lang: ShellLocale | undefined;
    readonly theme: ThemePreference;
}
export interface PreferenceOptions {
    /** The brand's root domain (`hoandat.com`): the cookie domain under it. */
    readonly domain: string;
    /** The app's own localStorage key of the theme before the shared cookie. */
    readonly legacyThemeKey?: string | undefined;
    /** The app's own localStorage key of the language before the shared cookie. */
    readonly legacyLangKey?: string | undefined;
}
type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;
/**
 * What the preferences touch in a page. The browser one wraps `document`,
 * `location` and `localStorage`; tests pass their own.
 */
export interface PreferenceEnvironment {
    readonly protocol: string;
    readonly hostname: string;
    readCookies(): string;
    writeCookie(cookie: string): void;
    /** Undefined when storage is blocked (privacy mode, sandboxed frame). */
    storage(): KeyValueStorage | undefined;
    /** Choices of this page view that neither a cookie nor storage could keep. */
    readonly memory: Map<PreferenceName, string>;
}
/** The page's environment, or undefined on a server. */
export declare function browserEnvironment(): PreferenceEnvironment | undefined;
export declare function isThemePreference(value: unknown): value is ThemePreference;
/**
 * The cookie domain for a page on `hostname`: the root domain when the page
 * is the root domain or a host under it, else none (a host-only cookie, as
 * on localhost or a preview host). An invalid root domain gives none.
 */
export declare function cookieDomainFor(hostname: string, domain: string): string | undefined;
/** The `document.cookie` string that stores one preference. */
export declare function preferenceCookie(name: PreferenceName, value: string, env: Pick<PreferenceEnvironment, "protocol" | "hostname">, domain: string): string;
/**
 * The visitor's choices: the shared cookie, else this WebView's storage,
 * else a pick made earlier in this page view, else the app's legacy key.
 * Theme defaults to "system"; language stays undefined for the app to pick.
 */
export declare function readPreferences(options: PreferenceOptions, env?: PreferenceEnvironment | undefined): Preferences;
/**
 * Stores one choice for every app under the root domain, falling back to
 * this WebView's localStorage when the cookie does not stick, then tells
 * the subscribers. Throws a RangeError for a value that is not a choice.
 */
export declare function writePreference<N extends PreferenceName>(name: N, value: PreferenceValues[N], options: PreferenceOptions, env?: PreferenceEnvironment | undefined): void;
/**
 * Calls `listener` after every write on this page and whenever the page
 * comes back into view (a choice made in another app's tab). Returns the
 * unsubscribe function.
 */
export declare function subscribePreferences(listener: () => void): () => void;
/**
 * Applies a theme to `<html data-theme>`: "system" removes the attribute so
 * tokens.css follows `prefers-color-scheme`. A no-op without a DOM.
 */
export declare function applyTheme(theme: ThemePreference, root?: HTMLElement): void;
export interface ThemeBootstrapOptions {
    /** Same as PreferenceOptions.legacyThemeKey. */
    readonly legacyThemeKey?: string | undefined;
}
/**
 * Body of an inline `<script>` for `<head>` that sets `data-theme` before
 * the first paint, reading what readPreferences reads (cookie, storage,
 * legacy key). The same options always give the same string, so a CSP can
 * allow it by hash.
 */
export declare function themeBootstrapScript(options?: ThemeBootstrapOptions): string;
export {};
