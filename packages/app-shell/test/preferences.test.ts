// @vitest-environment jsdom
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
	type DefaultShellLocale,
	SHELL_LOCALES,
	type ShellLocale,
	isShellLocale,
	matchShellLocale,
} from "../src/locale.js";
import {
	type PreferenceEnvironment,
	applyTheme,
	browserEnvironment,
	cookieDomainFor,
	preferenceCookie,
	readPreferences,
	subscribePreferences,
	themeBootstrapScript,
	writePreference,
} from "../src/preferences.js";

/**
 * A page at `url` with a cookie jar that keeps name=value of every write
 * (or drops them all, like a WebView on capacitor://), and its storage.
 */
function fakePage(
	url: string,
	{
		cookiesWork = true,
		storage = new Map<string, string>(),
	}: { cookiesWork?: boolean; storage?: Map<string, string> | null } = {},
) {
	const { protocol, hostname } = new URL(url);
	const jar = new Map<string, string>();
	const written: string[] = [];
	const env: PreferenceEnvironment = {
		protocol,
		hostname,
		readCookies: () =>
			[...jar].map(([name, value]) => `${name}=${value}`).join("; "),
		writeCookie: (cookie) => {
			written.push(cookie);
			if (!cookiesWork) return;
			const [pair = ""] = cookie.split(";");
			const index = pair.indexOf("=");
			jar.set(pair.slice(0, index), pair.slice(index + 1));
		},
		storage: () =>
			storage === null
				? undefined
				: {
						getItem: (key) => storage.get(key) ?? null,
						setItem: (key, value) => {
							storage.set(key, value);
						},
					},
		memory: new Map(),
	};
	return { env, jar, written, storage };
}

const OPTIONS = { domain: "hoandat.com" };

function clearDocumentCookies(): void {
	for (const part of document.cookie.split(";")) {
		const name = part.split("=")[0]?.trim();
		if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
	}
}

afterEach(() => {
	clearDocumentCookies();
	localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
	vi.restoreAllMocks();
});

describe("cookieDomainFor", () => {
	it("is the root domain for the root and every host under it", () => {
		expect(cookieDomainFor("hoandat.com", "hoandat.com")).toBe("hoandat.com");
		expect(cookieDomainFor("scribe.hoandat.com", "hoandat.com")).toBe(
			"hoandat.com",
		);
		expect(cookieDomainFor("A.B.HOANDAT.COM.", "hoandat.com")).toBe(
			"hoandat.com",
		);
	});

	it("is none on localhost, other hosts and look-alike hosts", () => {
		expect(cookieDomainFor("localhost", "hoandat.com")).toBeUndefined();
		expect(cookieDomainFor("127.0.0.1", "hoandat.com")).toBeUndefined();
		expect(cookieDomainFor("evilhoandat.com", "hoandat.com")).toBeUndefined();
		expect(
			cookieDomainFor("hoandat.com.evil.io", "hoandat.com"),
		).toBeUndefined();
	});

	it("is none for a root domain that is not one", () => {
		expect(cookieDomainFor("localhost", "localhost:5173")).toBeUndefined();
		expect(cookieDomainFor("x.com", "com")).toBeUndefined();
	});
});

describe("preferenceCookie", () => {
	it("shares the cookie with the root domain over https for a year", () => {
		const { env } = fakePage("https://scribe.hoandat.com/login");
		expect(preferenceCookie("theme", "dark", env, "hoandat.com")).toBe(
			"hd_theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Domain=hoandat.com; Secure",
		);
	});

	it("is host-only and not Secure on http://localhost", () => {
		const { env } = fakePage("http://localhost:5173/");
		expect(preferenceCookie("lang", "vi", env, "hoandat.com")).toBe(
			"hd_lang=vi; Path=/; Max-Age=31536000; SameSite=Lax",
		);
	});
});

describe("writePreference and readPreferences", () => {
	it("stores both choices in the shared cookie under the root domain", () => {
		const page = fakePage("https://chat.hoandat.com/");
		writePreference("theme", "dark", OPTIONS, page.env);
		writePreference("lang", "en", OPTIONS, page.env);
		expect(page.written).toEqual([
			"hd_theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Domain=hoandat.com; Secure",
			"hd_lang=en; Path=/; Max-Age=31536000; SameSite=Lax; Domain=hoandat.com; Secure",
		]);
		expect(page.storage?.size).toBe(0);
		expect(readPreferences(OPTIONS, page.env)).toEqual({
			theme: "dark",
			lang: "en",
		});
	});

	it("reads a choice another app made (the shared cookie)", () => {
		const page = fakePage("https://localman.hoandat.com/");
		page.jar.set("hd_theme", "light");
		page.jar.set("hd_lang", "vi");
		expect(readPreferences(OPTIONS, page.env)).toEqual({
			theme: "light",
			lang: "vi",
		});
	});

	it("falls back to localStorage in a Capacitor WebView (capacitor://localhost)", () => {
		const page = fakePage("capacitor://localhost/");
		writePreference("theme", "dark", OPTIONS, page.env);
		expect(page.written).toEqual([]);
		expect(page.storage?.get("hd_theme")).toBe("dark");
		const reopened = fakePage("capacitor://localhost/", {
			storage: page.storage,
		});
		expect(readPreferences(OPTIONS, reopened.env).theme).toBe("dark");
	});

	it("falls back to localStorage when the cookie does not stick", () => {
		const page = fakePage("https://localhost/", { cookiesWork: false });
		writePreference("lang", "vi", OPTIONS, page.env);
		expect(page.written).toEqual([
			"hd_lang=vi; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
		]);
		expect(page.storage?.get("hd_lang")).toBe("vi");
		expect(readPreferences(OPTIONS, page.env).lang).toBe("vi");
	});

	it("keeps the choice for the page view when nothing can store it", () => {
		const page = fakePage("capacitor://localhost/", { storage: null });
		writePreference("theme", "light", OPTIONS, page.env);
		expect(readPreferences(OPTIONS, page.env).theme).toBe("light");
	});

	it("reads the app's legacy key until a shared choice exists", () => {
		const storage = new Map([
			["localman-theme", "dark"],
			["localman-lang", "vi-VN"],
		]);
		const page = fakePage("https://localman.hoandat.com/", { storage });
		const options = {
			...OPTIONS,
			legacyThemeKey: "localman-theme",
			legacyLangKey: "localman-lang",
		};
		expect(readPreferences(options, page.env)).toEqual({
			theme: "dark",
			lang: "vi",
		});
		expect(readPreferences(OPTIONS, page.env)).toEqual({
			theme: "system",
			lang: undefined,
		});
		page.jar.set("hd_theme", "light");
		expect(readPreferences(options, page.env).theme).toBe("light");
		page.jar.set("hd_theme", "system");
		expect(readPreferences(options, page.env).theme).toBe("system");
	});

	it("ignores stored values that are not choices", () => {
		const storage = new Map([["legacy", "blue"]]);
		const page = fakePage("https://chat.hoandat.com/", { storage });
		page.jar.set("hd_theme", "%E0%A4%A");
		page.jar.set("hd_lang", "zh-CN");
		expect(
			readPreferences({ ...OPTIONS, legacyThemeKey: "legacy" }, page.env),
		).toEqual({ theme: "system", lang: undefined });
	});

	it("reads zh-CN for an app with Chinese, and for no other app", () => {
		const storage = new Map([["localman-lang", "vi"]]);
		const page = fakePage("https://localman.hoandat.com/", { storage });
		writePreference("lang", "zh-CN", OPTIONS, page.env);
		expect(page.written).toEqual([
			"hd_lang=zh-CN; Path=/; Max-Age=31536000; SameSite=Lax; Domain=hoandat.com; Secure",
		]);
		const localman = {
			...OPTIONS,
			locales: ["en", "zh-CN", "vi"] as const,
		};
		expect(readPreferences(localman, page.env).lang).toBe("zh-CN");
		// An app with vi and en: the shared zh-CN is no choice, so the
		// app's own fallbacks (legacy key, then its default) apply.
		expect(readPreferences(OPTIONS, page.env).lang).toBeUndefined();
		expect(
			readPreferences({ ...OPTIONS, legacyLangKey: "localman-lang" }, page.env)
				.lang,
		).toBe("vi");
		expect(
			readPreferences({ ...OPTIONS, locales: ["vi", "en"] }, page.env).lang,
		).toBeUndefined();
	});

	it("types the language by the app's locales", () => {
		const page = fakePage("https://chat.hoandat.com/");
		expectTypeOf(readPreferences(OPTIONS, page.env).lang).toEqualTypeOf<
			DefaultShellLocale | undefined
		>();
		expectTypeOf(
			readPreferences({ ...OPTIONS, locales: ["en", "zh-CN"] }, page.env).lang,
		).toEqualTypeOf<"en" | "zh-CN" | undefined>();
	});

	it("rejects a value that is not a choice", () => {
		const page = fakePage("https://chat.hoandat.com/");
		expect(() =>
			writePreference("theme", "blue" as "dark", OPTIONS, page.env),
		).toThrow(RangeError);
		expect(() =>
			writePreference("lang", "vi-VN" as "vi", OPTIONS, page.env),
		).toThrow(RangeError);
		expect(() =>
			writePreference("lang", "zh" as "zh-CN", OPTIONS, page.env),
		).toThrow(RangeError);
		expect(page.written).toEqual([]);
	});

	it("works against the real document (host-only cookie on localhost)", () => {
		const env = browserEnvironment();
		expect(env?.hostname).toBe("localhost");
		writePreference("theme", "dark", OPTIONS);
		expect(document.cookie).toContain("hd_theme=dark");
		expect(readPreferences(OPTIONS).theme).toBe("dark");
	});

	it("returns the defaults without a page (server)", () => {
		expect(readPreferences(OPTIONS, undefined)).toEqual({
			theme: "system",
			lang: undefined,
		});
		expect(() =>
			writePreference("theme", "dark", OPTIONS, undefined),
		).not.toThrow();
	});
});

describe("subscribePreferences", () => {
	it("tells subscribers about writes and a page coming back into view", () => {
		const listener = vi.fn();
		const unsubscribe = subscribePreferences(listener);
		writePreference(
			"theme",
			"dark",
			OPTIONS,
			fakePage("https://hoandat.com/").env,
		);
		expect(listener).toHaveBeenCalledTimes(1);
		window.dispatchEvent(new Event("focus"));
		expect(listener).toHaveBeenCalledTimes(2);
		unsubscribe();
		window.dispatchEvent(new Event("focus"));
		writePreference(
			"theme",
			"light",
			OPTIONS,
			fakePage("https://hoandat.com/").env,
		);
		expect(listener).toHaveBeenCalledTimes(2);
	});
});

describe("applyTheme", () => {
	it("sets data-theme for light and dark and removes it for system", () => {
		const root = document.documentElement;
		applyTheme("dark");
		expect(root.getAttribute("data-theme")).toBe("dark");
		applyTheme("light");
		expect(root.getAttribute("data-theme")).toBe("light");
		applyTheme("system");
		expect(root.hasAttribute("data-theme")).toBe(false);
	});
});

describe("themeBootstrapScript", () => {
	function run(script: string): string | null {
		new Function(script)();
		return document.documentElement.getAttribute("data-theme");
	}

	it("is the same string for the same options (CSP hash)", () => {
		expect(themeBootstrapScript()).toBe(themeBootstrapScript({}));
		expect(themeBootstrapScript({ legacyThemeKey: "x" })).not.toBe(
			themeBootstrapScript(),
		);
	});

	it("applies the shared cookie before anything else", () => {
		document.cookie = "hd_theme=dark; Path=/";
		localStorage.setItem("hd_theme", "light");
		expect(run(themeBootstrapScript())).toBe("dark");
	});

	it("leaves the attribute off for system, even with a legacy key", () => {
		document.cookie = "hd_theme=system; Path=/";
		localStorage.setItem("localman-theme", "dark");
		expect(
			run(themeBootstrapScript({ legacyThemeKey: "localman-theme" })),
		).toBe(null);
	});

	it("falls back to storage, then to the legacy key", () => {
		localStorage.setItem("localman-theme", "dark");
		expect(run(themeBootstrapScript())).toBe(null);
		expect(
			run(themeBootstrapScript({ legacyThemeKey: "localman-theme" })),
		).toBe("dark");
		localStorage.setItem("hd_theme", "light");
		expect(
			run(themeBootstrapScript({ legacyThemeKey: "localman-theme" })),
		).toBe("light");
	});

	it("ignores invalid values and never throws", () => {
		document.cookie = "hd_theme=blue; Path=/";
		expect(run(themeBootstrapScript())).toBe(null);
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		expect(() =>
			run(themeBootstrapScript({ legacyThemeKey: "x" })),
		).not.toThrow();
	});

	it("cannot close its <script> through the legacy key", () => {
		const script = themeBootstrapScript({ legacyThemeKey: "</script><b>" });
		expect(script).not.toContain("</script>");
		localStorage.setItem("</script><b>", "dark");
		expect(run(script)).toBe("dark");
	});
});

describe("matchShellLocale", () => {
	it("matches vi and en only when the app names no languages (as in 0.1)", () => {
		expect(matchShellLocale("vi-VN")).toBe("vi");
		expect(matchShellLocale("en_GB")).toBe("en");
		expect(matchShellLocale("zh-CN")).toBeUndefined();
		expect(matchShellLocale("fr")).toBeUndefined();
		expect(matchShellLocale(undefined)).toBeUndefined();
		expectTypeOf(matchShellLocale("vi")).toEqualTypeOf<
			DefaultShellLocale | undefined
		>();
	});

	it("matches every Chinese tag to zh-CN among the app's languages", () => {
		for (const tag of ["zh", "zh-CN", "zh-Hans", "zh-TW", "ZH_cn"]) {
			expect(matchShellLocale(tag, SHELL_LOCALES), tag).toBe("zh-CN");
		}
		expect(matchShellLocale("zh-CN", ["vi", "en"])).toBeUndefined();
		expect(matchShellLocale("vi", ["en", "zh-CN"])).toBeUndefined();
		expectTypeOf(matchShellLocale("x", ["en", "zh-CN"])).toEqualTypeOf<
			"en" | "zh-CN" | undefined
		>();
	});

	it("knows the exact shell locales", () => {
		expect(SHELL_LOCALES.every((locale) => isShellLocale(locale))).toBe(true);
		expect(isShellLocale("zh")).toBe(false);
		expect(isShellLocale("zh-cn")).toBe(false);
		expectTypeOf<ShellLocale>().toEqualTypeOf<"vi" | "en" | "zh-CN">();
	});
});
