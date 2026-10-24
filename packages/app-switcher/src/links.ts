/**
 * The switcher's list for one tenant, as plain data: no React, no DOM, so a
 * server or a test can build it too.
 */
import { hostsFor } from "@shared-next/brand/hosts";
import {
	APP_SWITCHER_APP_IDS,
	APP_SWITCHER_CATALOG,
	type AppSwitcherAppId,
	type AppSwitcherEntryId,
	type AppSwitcherLocale,
} from "./catalog.js";

/** `utm_medium` of every switcher link. */
export const APP_SWITCHER_UTM_MEDIUM = "app_switcher";

export interface AppSwitcherLinksOptions {
	/** The app showing the switcher: left out of the list, sent as `utm_source`. */
	readonly current: AppSwitcherAppId;
	/** The tenant's root domain, e.g. `hoandat.com` (no port, no path). */
	readonly tenantDomain: string;
	/** Chat and Scribe are listed only for the primary tenant. */
	readonly isPrimaryTenant: boolean;
	/** A BCP 47 tag such as `vi-VN` or `zh` (see `resolveAppSwitcherLocale`). */
	readonly locale: string;
}

export interface AppSwitcherLink {
	readonly id: AppSwitcherEntryId;
	readonly label: string;
	readonly description: string;
	/** Absolute https URL carrying `utm_source` and `utm_medium`. */
	readonly href: string;
}

/**
 * The catalog locale for a BCP 47 tag, by its language, case-insensitively:
 * `vi`, `vi-*` -> `vi`; `zh`, `zh-*` -> `zh-CN`; anything else -> English
 * (labels never go missing).
 */
export function resolveAppSwitcherLocale(locale: string): AppSwitcherLocale {
	const tag = locale.toLowerCase();
	const isLanguage = (language: string) =>
		tag === language || tag.startsWith(`${language}-`);
	if (isLanguage("vi")) return "vi";
	if (isLanguage("zh")) return "zh-CN";
	return "en";
}

/**
 * Links to the other apps of the tenant, then the account page, in catalog
 * order. Throws when `current` is not a catalog app or `tenantDomain` is not
 * a lowercase registrable domain (the IdP's domain rule).
 */
export function appSwitcherLinks(
	options: AppSwitcherLinksOptions,
): AppSwitcherLink[] {
	const { current, tenantDomain, isPrimaryTenant } = options;
	if (!(APP_SWITCHER_APP_IDS as readonly string[]).includes(current)) {
		throw new Error(`app-switcher: "${current}" is not a catalog app`);
	}
	const locale = resolveAppSwitcherLocale(options.locale);
	return APP_SWITCHER_CATALOG.filter(
		(entry) =>
			entry.id !== current && (isPrimaryTenant || !entry.primaryTenantOnly),
	).map((entry) => {
		const { webOrigin } = hostsFor(
			{ hostTemplates: { web: entry.hostTemplate } },
			tenantDomain,
		);
		const url = new URL(entry.path, webOrigin);
		url.searchParams.set("utm_source", current);
		url.searchParams.set("utm_medium", APP_SWITCHER_UTM_MEDIUM);
		return {
			id: entry.id,
			label: entry.label[locale],
			description: entry.description[locale],
			href: url.href,
		};
	});
}
