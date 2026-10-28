/**
 * Languages of the shared chrome. The app picks the page language and
 * passes it in; the chrome only knows how to say its own words in it.
 */

/** In switch order: Vietnamese first, the ecosystem's main audience. */
export const SHELL_LOCALES = ["vi", "en"] as const;

export type ShellLocale = (typeof SHELL_LOCALES)[number];

/** Each language in its own words (endonyms), never translated. */
export const SHELL_LOCALE_NAMES: Readonly<Record<ShellLocale, string>> = {
	vi: "Tiếng Việt",
	en: "English",
};

export function isShellLocale(value: unknown): value is ShellLocale {
	return value === "vi" || value === "en";
}

/**
 * The shell locale of a BCP 47 tag by its primary language ("vi-VN" is vi,
 * "en-GB" is en), or undefined for any other language.
 */
export function matchShellLocale(tag: unknown): ShellLocale | undefined {
	if (typeof tag !== "string") return undefined;
	const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
	return isShellLocale(primary) ? primary : undefined;
}
