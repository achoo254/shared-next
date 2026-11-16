export {
	APP_SWITCHER_APP_IDS,
	APP_SWITCHER_CATALOG,
	APP_SWITCHER_GROUPS,
	APP_SWITCHER_LOCALES,
	type AppSwitcherAppId,
	type AppSwitcherCatalogEntry,
	type AppSwitcherEntryId,
	type AppSwitcherGroup,
	type AppSwitcherLocale,
	type LocalizedText,
} from "./catalog.js";
export {
	CROSS_SELL_FALLBACK,
	CROSS_SELL_PAIRS,
	CROSS_SELL_UTM_SOURCE,
	type CrossSellAppId,
	crossSellHref,
	crossSellSuggestion,
} from "./cross-sell.js";
export {
	APP_SWITCHER_UTM_MEDIUM,
	type AppSwitcherLink,
	type AppSwitcherLinksOptions,
	appSwitcherLinks,
	resolveAppSwitcherLocale,
} from "./links.js";
export {
	AppSwitcher,
	type AppSwitcherPlacement,
	type AppSwitcherProps,
} from "./app-switcher.js";
