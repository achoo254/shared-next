/**
 * Cross-sell: the one app suggested to someone who uses a given app, from a
 * fixed pairing table. The IdP's welcome page (after a new account) and the
 * switcher's "Suggested" badge read it from here, so both always suggest
 * the same app. Plain data: no React, no DOM, no other import at runtime
 * (the IdP loads it on its server through `@achoo254/app-switcher/cross-sell`).
 */
import type { AppSwitcherEntryId } from "./catalog.js";

/** An app of the catalog (every entry except the account page). */
export type CrossSellAppId = Exclude<AppSwitcherEntryId, "account">;

/** `utm_source` of every suggested link. */
export const CROSS_SELL_UTM_SOURCE = "cross_sell";

/** Suggested to the users of any app the table does not pair. */
export const CROSS_SELL_FALLBACK = "webnhanh" satisfies CrossSellAppId;

/**
 * Origin app -> the one app suggested to its users. Never pairs an app with
 * itself; the fallback's own entry keeps it from suggesting itself.
 */
export const CROSS_SELL_PAIRS: Readonly<
	Partial<Record<CrossSellAppId, CrossSellAppId>>
> = {
	tuvi: "truyen",
	webnhanh: "kb",
	miu: "chuanho",
	chat: "clip",
	clip: "tuvi",
	kb: "webnhanh",
	truyen: "tuvi",
	chuanho: "miu",
};

function isPaired(origin: string): origin is keyof typeof CROSS_SELL_PAIRS {
	return Object.hasOwn(CROSS_SELL_PAIRS, origin);
}

/**
 * The app suggested to the users of `origin` (a catalog id such as
 * `tuvi`); an unknown or missing origin gets the fallback.
 */
export function crossSellSuggestion(
	origin: string | undefined,
): CrossSellAppId {
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
export function crossSellHref(
	href: string,
	origin: string,
	medium: string,
): string {
	const url = new URL(href);
	url.searchParams.set("utm_source", CROSS_SELL_UTM_SOURCE);
	url.searchParams.set("utm_medium", medium);
	url.searchParams.set("utm_campaign", origin);
	return url.href;
}
