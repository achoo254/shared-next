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

/** How a pick reaches the app: a callback, or a link per language. */
export type LanguageSwitchMode =
	| {
			/** Called after the choice is stored; the app re-renders in it. */
			readonly onLocaleChange: (locale: ShellLocale) => void;
			readonly languageHref?: undefined;
	  }
	| {
			/** The URL that switches to a language (a server route). */
			readonly languageHref: (locale: ShellLocale) => string;
			readonly onLocaleChange?: undefined;
	  };

export type LanguageSwitchProps = LanguageSwitchMode & {
	readonly locale: ShellLocale;
	/** The brand's root domain, for the shared cookie. */
	readonly domain: string;
	/**
	 * The app's languages in switch order; vi and en by default. Localman
	 * and the account app pass `["en", "zh-CN", "vi"]`.
	 */
	readonly locales?: readonly ShellLocale[] | undefined;
};

export function LanguageSwitch(props: LanguageSwitchProps): ReactNode {
	const { locale, domain, languageHref, onLocaleChange } = props;
	const label = SHELL_MESSAGES[locale].language;
	const locales = props.locales ?? DEFAULT_SHELL_LOCALES;
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
