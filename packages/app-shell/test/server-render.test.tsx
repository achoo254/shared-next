/**
 * auth-next renders its pages on the server with renderToStaticMarkup and
 * no DOM: the shell must render there, with the theme switch on "system"
 * and the language switch as plain links.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
	PublicPage,
	SignInCard,
	readPreferences,
	themeBootstrapScript,
} from "../src/index.js";

describe("server render (no DOM)", () => {
	it("runs without document or window", () => {
		expect(typeof document).toBe("undefined");
		expect(readPreferences({ domain: "hoandat.com" })).toEqual({
			theme: "system",
			lang: undefined,
		});
		expect(themeBootstrapScript()).toContain("hd_theme");
	});

	it("renders a whole page to static HTML", () => {
		const html = renderToStaticMarkup(
			<PublicPage
				brand={{
					appName: "hoandat",
					domain: "hoandat.com",
					markSrc: "/assets/img/hoandat-mark-128.webp",
				}}
				locale="vi"
				signInHref="/login"
				homeHref="/apps"
				navLinks={[
					{
						href: "/apps",
						label: "Trang chủ",
						dataId: "nav-home",
						current: true,
					},
				]}
				languageHref={(locale) => `/lang?set=${locale}&return=%2Fapps`}
				layout="center"
			>
				<SignInCard
					brand={{
						appName: "hoandat",
						domain: "hoandat.com",
						markSrc: "/m.webp",
					}}
					locale="vi"
					signInHref="/interaction/x/login"
					title="Đăng nhập"
				/>
			</PublicPage>,
		);
		// React 19 hoists a preload of the mark in front of the page.
		expect(html).toMatch(
			/^<link rel="preload" as="image" href="\/assets\/img\/hoandat-mark-128.webp"\/><div class="shell"><header class="shell-topbar" data-id="public-header">/,
		);
		expect(html).toContain(
			'<a href="/apps" class="shell-brand" data-id="public-home">',
		);
		expect(html).toContain('aria-current="page"');
		expect(html).toContain(
			'<main class="shell-main shell-container shell-main-center">',
		);
		expect(html).toContain(">Đăng nhập bằng hoandat.com</a>");
		expect(html).toContain('href="/lang?set=en&amp;return=%2Fapps"');
		expect(html).toContain(
			'data-id="lang-vi" href="/lang?set=vi&amp;return=%2Fapps" hrefLang="vi" aria-current="true"',
		);
		expect(html).toContain('data-id="theme-system"');
		expect(html).toMatch(/aria-pressed="true" data-id="theme-system"/);
		expect(html).toContain(">Một app của hoandat.com</a>");
		expect(html.endsWith("</footer></div>")).toBe(true);
	});
});
