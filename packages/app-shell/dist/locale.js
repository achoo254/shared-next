/**
 * Languages of the shared chrome. The app picks the page language and
 * passes it in; the chrome only knows how to say its own words in it.
 */
/** In switch order: Vietnamese first, the ecosystem's main audience. */
export const SHELL_LOCALES = ["vi", "en"];
/** Each language in its own words (endonyms), never translated. */
export const SHELL_LOCALE_NAMES = {
    vi: "Tiếng Việt",
    en: "English",
};
export function isShellLocale(value) {
    return value === "vi" || value === "en";
}
/**
 * The shell locale of a BCP 47 tag by its primary language ("vi-VN" is vi,
 * "en-GB" is en), or undefined for any other language.
 */
export function matchShellLocale(tag) {
    if (typeof tag !== "string")
        return undefined;
    const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
    return isShellLocale(primary) ? primary : undefined;
}
