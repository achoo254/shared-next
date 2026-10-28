/**
 * Languages of the shared chrome. The app picks the page language and
 * passes it in; the chrome only knows how to say its own words in it.
 */
/**
 * Every language the chrome speaks: Vietnamese first, the ecosystem's main
 * audience, then English and Simplified Chinese (Localman and the account
 * app).
 */
export const SHELL_LOCALES = ["vi", "en", "zh-CN"];
/**
 * The languages of an app that does not say which it has: the two of
 * every app. An app with Chinese passes its own list (e.g. Localman's
 * `["en", "zh-CN", "vi"]`), in the order its switch shows them.
 */
export const DEFAULT_SHELL_LOCALES = ["vi", "en"];
/** Each language in its own words (endonyms), never translated. */
export const SHELL_LOCALE_NAMES = {
    vi: "Tiếng Việt",
    en: "English",
    "zh-CN": "中文",
};
export function isShellLocale(value) {
    return (typeof value === "string" &&
        SHELL_LOCALES.includes(value));
}
/** The shell locale of a primary language subtag, if the chrome has one. */
function localeOfPrimary(primary) {
    if (primary === "vi")
        return "vi";
    if (primary === "en")
        return "en";
    // Every Chinese tag ("zh", "zh-Hans", "zh-TW"): the only Chinese written.
    if (primary === "zh")
        return "zh-CN";
    return undefined;
}
export function matchShellLocale(tag, locales = DEFAULT_SHELL_LOCALES) {
    if (typeof tag !== "string")
        return undefined;
    const locale = localeOfPrimary(tag.trim().toLowerCase().split(/[-_]/)[0]);
    return locale !== undefined && locales.includes(locale) ? locale : undefined;
}
