/**
 * dist/app-shell-enhance.js on a page rendered by renderToStaticMarkup, as
 * auth-next and Tunelo serve it: run in a fresh jsdom window (no React in
 * it) the way a browser runs an external classic script.
 */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicPage, type ShellBrand } from "../src/index.js";

const SCRIPT = readFileSync(
	new URL("../dist/app-shell-enhance.js", import.meta.url),
	"utf8",
);

const BRAND: ShellBrand = {
	appName: "hoandat",
	domain: "hoandat.com",
	markSrc: "/assets/img/hoandat-mark-128.webp",
};

const BODY = renderToStaticMarkup(
	<PublicPage
		brand={BRAND}
		locale="en"
		signInHref="/login"
		languageHref={(locale) => `/lang?set=${locale}`}
	>
		<p>Body</p>
	</PublicPage>,
);

interface Page {
	readonly window: JSDOM["window"];
	readonly document: Document;
	readonly root: HTMLElement;
	button(theme: string): HTMLButtonElement;
	pressed(): string[];
}

/**
 * A page on `url` that runs the script while it is still loading (from
 * `<head>`), with cookies set beforehand; resolves once the DOM is ready.
 */
async function open(url: string, cookie?: string): Promise<Page> {
	const dom = new JSDOM(
		`<!DOCTYPE html><html lang="en"><head></head><body>${BODY}</body></html>`,
		{ url, runScripts: "outside-only" },
	);
	const { window } = dom;
	if (cookie) window.document.cookie = cookie;
	window.eval(SCRIPT);
	const document = window.document;
	if (document.readyState === "loading") {
		await new Promise((resolve) =>
			document.addEventListener("DOMContentLoaded", resolve, { once: true }),
		);
	}
	return {
		window,
		document,
		root: document.documentElement,
		button(theme) {
			const button = document.querySelector<HTMLButtonElement>(
				`[data-id="theme-${theme}"]`,
			);
			if (!button) throw new Error(`no theme-${theme} button`);
			return button;
		},
		pressed() {
			return [...document.querySelectorAll('[data-id="theme-switch"] button')]
				.filter((button) => button.getAttribute("aria-pressed") === "true")
				.map((button) => button.getAttribute("value") ?? "");
		},
	};
}

describe("app-shell-enhance.js", () => {
	it("is one classic script with no imports or exports", () => {
		expect(SCRIPT).not.toMatch(/^\s*(?:import|export)\b/m);
		expect(SCRIPT).not.toMatch(/\bimport\(/);
		expect(SCRIPT).toContain("(() => {");
	});

	it("renders no inline script or style a strict CSP would block", () => {
		expect(BODY).not.toMatch(/<script|\sstyle=|\son[a-z]+=/i);
	});

	it("marks the server-rendered switch with the cookie domain", () => {
		expect(BODY).toContain(
			'<fieldset class="shell-theme-switch" data-id="theme-switch" data-domain="hoandat.com">',
		);
	});

	it("applies the stored theme before the DOM is ready, then marks it in the switch", async () => {
		const dom = new JSDOM("<!DOCTYPE html><html><head>", {
			url: "https://auth.hoandat.com/",
			runScripts: "outside-only",
		});
		dom.window.document.cookie = "hd_theme=dark";
		dom.window.eval(SCRIPT);
		expect(dom.window.document.documentElement.getAttribute("data-theme")).toBe(
			"dark",
		);
		const page = await open("https://auth.hoandat.com/login", "hd_theme=dark");
		expect(page.root.getAttribute("data-theme")).toBe("dark");
		expect(page.pressed()).toEqual(["dark"]);
	});

	it("stores a click for the root domain, applies it and moves aria-pressed", async () => {
		const page = await open("https://auth.hoandat.com/login");
		expect(page.root.hasAttribute("data-theme")).toBe(false);
		expect(page.pressed()).toEqual(["system"]);

		page.button("light").click();
		expect(page.root.getAttribute("data-theme")).toBe("light");
		expect(page.pressed()).toEqual(["light"]);
		expect(page.document.cookie).toContain("hd_theme=light");

		// The cookie is the root domain's: another app under it reads it.
		const other = await open(
			"https://localman.hoandat.com/",
			page.document.cookie,
		);
		expect(other.root.getAttribute("data-theme")).toBe("light");

		page.button("system").click();
		expect(page.root.hasAttribute("data-theme")).toBe(false);
		expect(page.pressed()).toEqual(["system"]);
	});

	it("follows a choice made in another tab when the page comes back into view", async () => {
		const page = await open("https://auth.hoandat.com/login");
		page.document.cookie = "hd_theme=dark; Path=/; Domain=hoandat.com";
		expect(page.pressed()).toEqual(["system"]);
		page.window.dispatchEvent(new page.window.FocusEvent("focus"));
		expect(page.root.getAttribute("data-theme")).toBe("dark");
		expect(page.pressed()).toEqual(["dark"]);
	});

	it("works once when the page loads it twice", async () => {
		const page = await open("http://localhost:3000/");
		page.window.eval(SCRIPT);
		let writes = 0;
		const descriptor = Object.getOwnPropertyDescriptor(
			page.window.Document.prototype,
			"cookie",
		);
		Object.defineProperty(page.document, "cookie", {
			configurable: true,
			get: () => descriptor?.get?.call(page.document),
			set: (value: string) => {
				writes += 1;
				descriptor?.set?.call(page.document, value);
			},
		});
		page.button("dark").click();
		expect(writes).toBe(1);
		expect(page.root.getAttribute("data-theme")).toBe("dark");
	});

	it("leaves the language switch as links to the server", async () => {
		const page = await open("https://auth.hoandat.com/login");
		const options = [
			...page.document.querySelectorAll('[data-id="lang-switch"] a'),
		];
		expect(options.map((link) => link.getAttribute("href"))).toEqual([
			"/lang?set=vi",
			"/lang?set=en",
		]);
		expect(page.document.querySelector('[data-id="lang-switch"] button')).toBe(
			null,
		);
	});
});
