/**
 * Source of dist/app-shell-enhance.js: the theme switch of a page rendered
 * on a server (renderToStaticMarkup) that runs no React in the browser,
 * under a CSP without 'unsafe-inline'. Bundled into one classic script
 * with no imports, served by the app as a `script-src 'self'` file.
 *
 * Loaded in `<head>` (no defer), it applies the stored theme before the
 * first paint, as themeBootstrapScript does inline. Then every server-
 * rendered ThemeSwitch (`[data-id="theme-switch"]`) works: a click stores
 * `hd_theme` for the root domain in its `data-domain`, sets `data-theme`
 * and moves `aria-pressed`. A choice made in another app's tab is picked
 * up when the page comes back into view. The language switch of such a
 * page stays links to the server (`languageHref`), with no script. Each
 * server-rendered AccountMenu closes on an outside click, Escape, tabbing
 * away or a chosen item, as it does in React.
 */
import { wireAccountMenu } from "./account-menu-behavior.js";
import {
	THEME_PREFERENCES,
	type ThemePreference,
	applyTheme,
	readPreferences,
	subscribePreferences,
	writePreference,
} from "./preferences.js";

const SWITCH = '[data-id="theme-switch"]';

/** Reading needs no root domain: the cookie is sent to every host under it. */
function storedTheme(): ThemePreference {
	return readPreferences({ domain: "" }).theme;
}

function isTheme(value: string): value is ThemePreference {
	return (THEME_PREFERENCES as readonly string[]).includes(value);
}

/** Marks the stored theme pressed in every switch of the page. */
function syncSwitches(theme: ThemePreference): void {
	for (const button of document.querySelectorAll<HTMLButtonElement>(
		`${SWITCH} button[value]`,
	)) {
		button.setAttribute("aria-pressed", String(button.value === theme));
	}
}

function follow(): void {
	const theme = storedTheme();
	applyTheme(theme);
	syncSwitches(theme);
}

/** One listener for the whole page: switches rendered later work too. */
function onClick(event: MouseEvent): void {
	const target = event.target;
	if (!(target instanceof Element)) return;
	const button = target.closest<HTMLButtonElement>(`${SWITCH} button[value]`);
	const fieldset = button?.closest<HTMLElement>(SWITCH);
	if (!button || !fieldset || !isTheme(button.value)) return;
	try {
		writePreference("theme", button.value, {
			domain: fieldset.dataset.domain ?? "",
		});
	} finally {
		// Shown even when nothing could store it: the page follows the click.
		applyTheme(button.value);
		syncSwitches(button.value);
	}
}

function wireAccountMenus(): void {
	for (const menu of document.querySelectorAll<HTMLDetailsElement>(
		'details[data-id="account-menu"]',
	)) {
		wireAccountMenu(menu);
	}
}

function start(): void {
	// A second copy of the script on the page must not double every click.
	const root = document.documentElement;
	if (root.hasAttribute("data-shell-enhanced")) return;
	root.setAttribute("data-shell-enhanced", "");
	applyTheme(storedTheme());
	document.addEventListener("click", onClick);
	subscribePreferences(follow);
	if (document.readyState === "loading") {
		document.addEventListener(
			"DOMContentLoaded",
			() => {
				follow();
				wireAccountMenus();
			},
			{ once: true },
		);
	} else {
		follow();
		wireAccountMenus();
	}
}

start();
