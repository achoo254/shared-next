/**
 * Languages of the shared chrome. The app picks the page language and
 * passes it in; the chrome only knows how to say its own words in it.
 */

/**
 * Every language the chrome speaks: Vietnamese first, the ecosystem's main
 * audience, then English and Simplified Chinese (Localman and the account
 * app).
 */
export const SHELL_LOCALES = ["vi", "en", "zh-CN"] as const;

export type ShellLocale = (typeof SHELL_LOCALES)[number];

/**
 * The languages of an app that does not say which it has: the two of
 * every app. An app with Chinese passes its own list (e.g. Localman's
 * `["en", "zh-CN", "vi"]`), in the order its switch shows them.
 */
export const DEFAULT_SHELL_LOCALES = ["vi", "en"] as const;

export type DefaultShellLocale = (typeof DEFAULT_SHELL_LOCALES)[number];

/** Each language in its own words (endonyms), never translated. */
export const SHELL_LOCALE_NAMES: Readonly<Record<ShellLocale, string>> = {
	vi: "Tiếng Việt",
	en: "English",
	"zh-CN": "中文",
};

export function isShellLocale(value: unknown): value is ShellLocale {
	return (
		typeof value === "string" &&
		(SHELL_LOCALES as readonly string[]).includes(value)
	);
}

/** The shell locale of a primary language subtag, if the chrome has one. */
function localeOfPrimary(primary: string | undefined): ShellLocale | undefined {
	if (primary === "vi") return "vi";
	if (primary === "en") return "en";
	// Every Chinese tag ("zh", "zh-Hans", "zh-TW"): the only Chinese written.
	if (primary === "zh") return "zh-CN";
	return undefined;
}

/**
 * The language of a BCP 47 tag by its primary subtag ("vi-VN" is vi, "en-GB"
 * is en, any Chinese tag is zh-CN), among the app's `locales`; undefined for
 * any other language. Without `locales` only vi and en match, as in 0.1.
 */
export function matchShellLocale(tag: unknown): DefaultShellLocale | undefined;
export function matchShellLocale<L extends ShellLocale>(
	tag: unknown,
	locales: readonly L[],
): L | undefined;
export function matchShellLocale(
	tag: unknown,
	locales: readonly ShellLocale[] = DEFAULT_SHELL_LOCALES,
): ShellLocale | undefined {
	if (typeof tag !== "string") return undefined;
	const locale = localeOfPrimary(tag.trim().toLowerCase().split(/[-_]/)[0]);
	return locale !== undefined && locales.includes(locale) ? locale : undefined;
}
