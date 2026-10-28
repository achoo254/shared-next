/**
 * The language pill: one option per language of the app, the current one
 * marked. In an app it is a fieldset of buttons that store the shared
 * `hd_lang` cookie and tell the app; on a page without script (auth-next)
 * it is a nav of links to a URL that sets the cookie on the server.
 */
import type { ReactNode } from "react";
import {
	DEFAULT_SHELL_LOCALES,
	SHELL_LOCALE_NAMES,
	type ShellLocale,
} from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import { writePreference } from "./preferences.js";

/**
 * How a pick reaches the app: a callback, or a link per language. `L` is
 * the app's languages (its `locales`), so a vi/en app passes its own
 * `(locale: "vi" | "en") => void`.
 */
export type LanguageSwitchMode<L extends ShellLocale = ShellLocale> =
	| {
			/** Called after the choice is stored; the app re-renders in it. */
			readonly onLocaleChange: (locale: L) => void;
			readonly languageHref?: undefined;
	  }
	| {
			/** The URL that switches to a language (a server route). */
			readonly languageHref: (locale: L) => string;
			readonly onLocaleChange?: undefined;
	  };

export type LanguageSwitchProps<L extends ShellLocale = ShellLocale> =
	LanguageSwitchMode<L> & {
		readonly locale: L;
		/** The brand's root domain, for the shared cookie. */
		readonly domain: string;
		/**
		 * The app's languages in switch order; vi and en by default. Localman
		 * and the account app pass `["en", "zh-CN", "vi"]`. Pass them whenever
		 * `L` is not vi and en, so the callback only gets the app's own.
		 */
		readonly locales?: readonly L[] | undefined;
	};

export function LanguageSwitch<L extends ShellLocale = ShellLocale>(
	props: LanguageSwitchProps<L>,
): ReactNode {
	const { locale, domain, languageHref, onLocaleChange } = props;
	const label = SHELL_MESSAGES[locale].language;
	// Without `locales` the app has vi and en, which `L` then covers.
	const locales: readonly L[] =
		props.locales ??
		(DEFAULT_SHELL_LOCALES as readonly ShellLocale[] as readonly L[]);
	const options = locales.map((option) => {
		const common = {
			className: "shell-lang-option",
			lang: option,
			"data-id": `lang-${option}`,
			children: SHELL_LOCALE_NAMES[option],
		};
		if (languageHref) {
			return (
				<a
					{...common}
					key={option}
					href={languageHref(option)}
					hrefLang={option}
					aria-current={option === locale ? "true" : undefined}
				/>
			);
		}
		return (
			<button
				{...common}
				key={option}
				type="button"
				aria-pressed={option === locale}
				onClick={() => {
					writePreference("lang", option, { domain });
					onLocaleChange?.(option);
				}}
			/>
		);
	});
	if (languageHref) {
		return (
			<nav
				className="shell-lang-switch"
				aria-label={label}
				data-id="lang-switch"
			>
				{options}
			</nav>
		);
	}
	return (
		<fieldset className="shell-lang-switch" data-id="lang-switch">
			<legend className="shell-sr-only">{label}</legend>
			{options}
		</fieldset>
	);
}
