/**
 * Language and theme choices shared by every app of one root domain, with
 * no framework: cookies `hd_lang` and `hd_theme` set for `Domain=<root
 * domain>` when the page is served under it, so a choice made on one app is
 * what the next app opens with. Where cookies do not work (a Capacitor
 * WebView on `capacitor://localhost`) the choice is kept in localStorage of
 * that WebView. An app's older localStorage key is read while no shared
 * choice exists yet, so nobody loses the theme they picked before.
 *
 * Safe to import on a server: without a DOM every read returns the
 * defaults and every write is a no-op.
 */
import { DOMAIN_PATTERN } from "@achoo254/brand/hosts";
import {
	DEFAULT_SHELL_LOCALES,
	type DefaultShellLocale,
	SHELL_LOCALES,
	type ShellLocale,
	matchShellLocale,
} from "./locale.js";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_PREFERENCES: readonly ThemePreference[] = [
	"light",
	"dark",
	"system",
];

/** Cookie (and storage key) of each preference; auth-next reads `hd_lang` too. */
export const PREFERENCE_KEYS = {
	lang: "hd_lang",
	theme: "hd_theme",
} as const;

export type PreferenceName = keyof typeof PREFERENCE_KEYS;

export interface PreferenceValues {
	readonly lang: ShellLocale;
	readonly theme: ThemePreference;
}

export interface Preferences<L extends ShellLocale = ShellLocale> {
	/**
	 * Undefined until someone picks one of the app's languages: the app
	 * chooses its default.
	 */
	readonly lang: L | undefined;
	readonly theme: ThemePreference;
}

export interface PreferenceOptions {
	/** The brand's root domain (`hoandat.com`): the cookie domain under it. */
	readonly domain: string;
	/** The app's own localStorage key of the theme before the shared cookie. */
	readonly legacyThemeKey?: string | undefined;
	/** The app's own localStorage key of the language before the shared cookie. */
	readonly legacyLangKey?: string | undefined;
}

/** PreferenceOptions of an app that names its languages. */
export interface LocalePreferenceOptions<L extends ShellLocale>
	extends PreferenceOptions {
	/**
	 * The app's languages: a stored language outside them (`zh-CN` from
	 * Localman in an app without Chinese) counts as no choice.
	 */
	readonly locales: readonly L[];
}

/** One year, as auth-next keeps its language cookie. */
const MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * What the preferences touch in a page. The browser one wraps `document`,
 * `location` and `localStorage`; tests pass their own.
 */
export interface PreferenceEnvironment {
	readonly protocol: string;
	readonly hostname: string;
	readCookies(): string;
	writeCookie(cookie: string): void;
	/** Undefined when storage is blocked (privacy mode, sandboxed frame). */
	storage(): KeyValueStorage | undefined;
	/** Choices of this page view that neither a cookie nor storage could keep. */
	readonly memory: Map<PreferenceName, string>;
}

let browser: PreferenceEnvironment | undefined;

/** The page's environment, or undefined on a server. */
export function browserEnvironment(): PreferenceEnvironment | undefined {
	if (typeof document === "undefined" || typeof location === "undefined") {
		return undefined;
	}
	browser ??= {
		protocol: location.protocol,
		hostname: location.hostname,
		readCookies: () => document.cookie,
		writeCookie: (cookie) => {
			document.cookie = cookie;
		},
		storage: () => {
			try {
				return window.localStorage;
			} catch {
				return undefined;
			}
		},
		memory: new Map(),
	};
	return browser;
}

export function isThemePreference(value: unknown): value is ThemePreference {
	return value === "light" || value === "dark" || value === "system";
}

const PARSERS: {
	readonly [N in PreferenceName]: (
		raw: string,
	) => PreferenceValues[N] | undefined;
} = {
	lang: (raw) => matchShellLocale(raw, SHELL_LOCALES),
	theme: (raw) => (isThemePreference(raw) ? raw : undefined),
};

/** A stored string as a choice, or undefined when it is none. */
function parse<N extends PreferenceName>(
	name: N,
	raw: string | null | undefined,
): PreferenceValues[N] | undefined {
	if (raw === null || raw === undefined) return undefined;
	const parser: (raw: string) => PreferenceValues[N] | undefined =
		PARSERS[name];
	return parser(raw);
}

/**
 * The cookie domain for a page on `hostname`: the root domain when the page
 * is the root domain or a host under it, else none (a host-only cookie, as
 * on localhost or a preview host). An invalid root domain gives none.
 */
export function cookieDomainFor(
	hostname: string,
	domain: string,
): string | undefined {
	if (!DOMAIN_PATTERN.test(domain)) return undefined;
	const host = hostname.toLowerCase().replace(/\.$/, "");
	return host === domain || host.endsWith(`.${domain}`) ? domain : undefined;
}

/** Cookies only exist for pages served over http(s). */
function cookiesApply(env: PreferenceEnvironment): boolean {
	return env.protocol === "https:" || env.protocol === "http:";
}

/** The `document.cookie` string that stores one preference. */
export function preferenceCookie(
	name: PreferenceName,
	value: string,
	env: Pick<PreferenceEnvironment, "protocol" | "hostname">,
	domain: string,
): string {
	const parts = [
		`${PREFERENCE_KEYS[name]}=${encodeURIComponent(value)}`,
		"Path=/",
		`Max-Age=${MAX_AGE_SECONDS}`,
		"SameSite=Lax",
	];
	const cookieDomain = cookieDomainFor(env.hostname, domain);
	if (cookieDomain) parts.push(`Domain=${cookieDomain}`);
	if (env.protocol === "https:") parts.push("Secure");
	return parts.join("; ");
}

function readCookie(cookies: string, key: string): string | undefined {
	for (const part of cookies.split(";")) {
		const index = part.indexOf("=");
		if (index < 0 || part.slice(0, index).trim() !== key) continue;
		try {
			return decodeURIComponent(part.slice(index + 1).trim());
		} catch {
			return undefined;
		}
	}
	return undefined;
}

function readStorage(
	storage: KeyValueStorage | undefined,
	key: string | undefined,
): string | null {
	if (!storage || !key) return null;
	try {
		return storage.getItem(key);
	} catch {
		return null;
	}
}

/** Whether the value was stored; storage may be missing or throw. */
function writeStorage(
	storage: KeyValueStorage | undefined,
	key: string,
	value: string,
): boolean {
	if (!storage) return false;
	try {
		storage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

/** The first stored value `accept` takes, in the order readPreferences documents. */
function readOne<T>(
	name: PreferenceName,
	accept: (raw: string | null | undefined) => T | undefined,
	env: PreferenceEnvironment,
	legacyKey: string | undefined,
): T | undefined {
	const key = PREFERENCE_KEYS[name];
	const storage = env.storage();
	return (
		(cookiesApply(env)
			? accept(readCookie(env.readCookies(), key))
			: undefined) ??
		accept(readStorage(storage, key)) ??
		accept(env.memory.get(name)) ??
		accept(readStorage(storage, legacyKey))
	);
}

/**
 * The visitor's choices: the shared cookie, else this WebView's storage,
 * else a pick made earlier in this page view, else the app's legacy key.
 * Theme defaults to "system"; language stays undefined for the app to pick,
 * also when the stored one is not among the app's `locales` (vi and en
 * when not given).
 */
export function readPreferences<L extends ShellLocale>(
	options: LocalePreferenceOptions<L>,
	env?: PreferenceEnvironment | undefined,
): Preferences<L>;
export function readPreferences(
	options: PreferenceOptions,
	env?: PreferenceEnvironment | undefined,
): Preferences<DefaultShellLocale>;
export function readPreferences(
	options: PreferenceOptions & {
		readonly locales?: readonly ShellLocale[] | undefined;
	},
	env: PreferenceEnvironment | undefined = browserEnvironment(),
): Preferences {
	if (!env) return { lang: undefined, theme: "system" };
	const locales = options.locales ?? DEFAULT_SHELL_LOCALES;
	return {
		lang: readOne(
			"lang",
			(raw) => matchShellLocale(raw, locales),
			env,
			options.legacyLangKey,
		),
		theme:
			readOne(
				"theme",
				(raw) => parse("theme", raw),
				env,
				options.legacyThemeKey,
			) ?? "system",
	};
}

const listeners = new Set<() => void>();

function notify(): void {
	for (const listener of [...listeners]) listener();
}

/**
 * Stores one choice for every app under the root domain, falling back to
 * this WebView's localStorage when the cookie does not stick, then tells
 * the subscribers. Throws a RangeError for a value that is not a choice.
 */
export function writePreference<N extends PreferenceName>(
	name: N,
	value: PreferenceValues[N],
	options: PreferenceOptions,
	env: PreferenceEnvironment | undefined = browserEnvironment(),
): void {
	if (parse(name, value) !== value) {
		throw new RangeError(`app-shell: "${String(value)}" is not a ${name}`);
	}
	if (!env) return;
	const key = PREFERENCE_KEYS[name];
	let stored = false;
	if (cookiesApply(env)) {
		env.writeCookie(preferenceCookie(name, value, env, options.domain));
		stored = readCookie(env.readCookies(), key) === value;
	}
	if (!stored) stored = writeStorage(env.storage(), key, value);
	// Neither stuck: the choice lasts for this page view.
	if (stored) env.memory.delete(name);
	else env.memory.set(name, value);
	notify();
}

function onVisible(): void {
	if (document.visibilityState === "visible") notify();
}

/**
 * Calls `listener` after every write on this page and whenever the page
 * comes back into view (a choice made in another app's tab). Returns the
 * unsubscribe function.
 */
export function subscribePreferences(listener: () => void): () => void {
	listeners.add(listener);
	if (listeners.size === 1 && typeof window !== "undefined") {
		window.addEventListener("focus", notify);
		document.addEventListener("visibilitychange", onVisible);
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && typeof window !== "undefined") {
			window.removeEventListener("focus", notify);
			document.removeEventListener("visibilitychange", onVisible);
		}
	};
}

/**
 * Applies a theme to `<html data-theme>`: "system" removes the attribute so
 * tokens.css follows `prefers-color-scheme`. A no-op without a DOM.
 */
export function applyTheme(theme: ThemePreference, root?: HTMLElement): void {
	const element =
		root ??
		(typeof document === "undefined" ? undefined : document.documentElement);
	if (!element) return;
	if (theme === "system") element.removeAttribute("data-theme");
	else element.setAttribute("data-theme", theme);
}

export interface ThemeBootstrapOptions {
	/** Same as PreferenceOptions.legacyThemeKey. */
	readonly legacyThemeKey?: string | undefined;
}

/** A string literal safe inside an inline `<script>`. */
function scriptString(value: string): string {
	return JSON.stringify(value)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

/**
 * Body of an inline `<script>` for `<head>` that sets `data-theme` before
 * the first paint, reading what readPreferences reads (cookie, storage,
 * legacy key). The same options always give the same string, so a CSP can
 * allow it by hash.
 */
export function themeBootstrapScript(
	options: ThemeBootstrapOptions = {},
): string {
	const key = PREFERENCE_KEYS.theme;
	const legacy =
		options.legacyThemeKey === undefined
			? "null"
			: scriptString(options.legacyThemeKey);
	return [
		"(function(){try{",
		'function ok(t){return t==="light"||t==="dark"||t==="system"}',
		`var m=/(?:^|;\\s*)${key}=([^;]*)/.exec(document.cookie);`,
		"var t=m?m[1]:null;",
		"var s=null;try{s=window.localStorage}catch(e){}",
		`if(!ok(t)&&s){t=s.getItem(${scriptString(key)});var l=${legacy};if(!ok(t)&&l){t=s.getItem(l)}}`,
		'if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}',
		"}catch(e){}})();",
	].join("");
}
