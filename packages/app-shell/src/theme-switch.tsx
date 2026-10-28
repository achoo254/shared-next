/**
 * Light / dark / system switch. The choice goes into the shared `hd_theme`
 * cookie (preferences.ts) and onto `<html data-theme>`; every switch on the
 * page, and the page itself when it comes back into view after a choice in
 * another app, follows the stored value.
 */
import { type ReactNode, useCallback, useSyncExternalStore } from "react";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import {
	type PreferenceOptions,
	THEME_PREFERENCES,
	type ThemePreference,
	applyTheme,
	readPreferences,
	subscribePreferences,
	writePreference,
} from "./preferences.js";
import { ThemeIcon } from "./theme-icons.js";

export interface ThemeSwitchProps {
	readonly locale: ShellLocale;
	/** The brand's root domain, for the shared cookie. */
	readonly domain: string;
	/** The app's localStorage key of the theme before the shared cookie. */
	readonly legacyThemeKey?: string | undefined;
}

/** A server render (and the first hydrating one) cannot read the cookie. */
const serverTheme = (): ThemePreference => "system";

/**
 * The stored theme. A change made elsewhere (another tab or app) is applied
 * to the page when it is noticed; nothing is applied on mount, where the
 * head script (themeBootstrapScript) has already set it.
 */
export function useThemePreference(
	options: PreferenceOptions,
): ThemePreference {
	const { domain, legacyThemeKey } = options;
	const subscribe = useCallback(
		(onChange: () => void) =>
			subscribePreferences(() => {
				applyTheme(readPreferences({ domain, legacyThemeKey }).theme);
				onChange();
			}),
		[domain, legacyThemeKey],
	);
	return useSyncExternalStore(
		subscribe,
		() => readPreferences({ domain, legacyThemeKey }).theme,
		serverTheme,
	);
}

export function ThemeSwitch(props: ThemeSwitchProps): ReactNode {
	const { locale, domain, legacyThemeKey } = props;
	const t = SHELL_MESSAGES[locale];
	const current = useThemePreference({ domain, legacyThemeKey });

	function pick(theme: ThemePreference): void {
		writePreference("theme", theme, { domain });
		applyTheme(theme);
	}

	return (
		<fieldset
			className="shell-theme-switch"
			data-id="theme-switch"
			// Read by app-shell-enhance.js on pages without React.
			data-domain={domain}
		>
			<legend className="shell-sr-only">{t.theme}</legend>
			{THEME_PREFERENCES.map((theme) => (
				<button
					key={theme}
					type="button"
					className="shell-theme-option"
					value={theme}
					aria-label={t.themes[theme]}
					title={t.themes[theme]}
					aria-pressed={theme === current}
					data-id={`theme-${theme}`}
					onClick={() => pick(theme)}
				>
					<ThemeIcon theme={theme} />
				</button>
			))}
		</fieldset>
	);
}
