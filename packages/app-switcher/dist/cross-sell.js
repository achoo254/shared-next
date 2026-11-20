/** `utm_source` of every suggested link. */
export const CROSS_SELL_UTM_SOURCE = "cross_sell";
/** Suggested to the users of any app the table does not pair. */
export const CROSS_SELL_FALLBACK = "webnhanh";
/**
 * Origin app -> the one app suggested to its users. Never pairs an app with
 * itself; the fallback's own entry keeps it from suggesting itself.
 */
export const CROSS_SELL_PAIRS = {
    tuvi: "clip",
    webnhanh: "kb",
    miu: "chuanho",
    chat: "clip",
    clip: "tuvi",
    kb: "webnhanh",
    chuanho: "miu",
};
function isPaired(origin) {
    return Object.hasOwn(CROSS_SELL_PAIRS, origin);
}
/**
 * The app suggested to the users of `origin` (a catalog id such as
 * `tuvi`); an unknown or missing origin gets the fallback.
 */
export function crossSellSuggestion(origin) {
    if (origin !== undefined && isPaired(origin)) {
        return CROSS_SELL_PAIRS[origin] ?? CROSS_SELL_FALLBACK;
    }
    return CROSS_SELL_FALLBACK;
}
/**
 * `href` with the cross-sell tags: `utm_source=cross_sell`,
 * `utm_medium=<medium>` (where it was shown, e.g. `welcome` or
 * `app_switcher`) and `utm_campaign=<origin>`, replacing any of them
 * already there. Throws on a `href` that is not an absolute URL.
 */
export function crossSellHref(href, origin, medium) {
    const url = new URL(href);
    url.searchParams.set("utm_source", CROSS_SELL_UTM_SOURCE);
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", origin);
    return url.href;
}
