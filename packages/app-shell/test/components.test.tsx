// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	FeatureList,
	Hero,
	LanguageSwitch,
	PublicFooter,
	PublicHeader,
	PublicPage,
	type ShellAnchorProps,
	type ShellBrand,
	type ShellLocale,
	SignInCard,
	ThemeSwitch,
} from "../src/index.js";

const BRAND: ShellBrand = {
	appName: "Scribe",
	domain: "hoandat.com",
	markSrc: "/brand/mark-64.webp",
};

/** The data-id element, or a failure naming it. */
function byDataId(id: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(`[data-id="${id}"]`);
	if (!element) throw new Error(`no [data-id="${id}"]`);
	return element;
}

function clearDocumentCookies(): void {
	for (const part of document.cookie.split(";")) {
		const name = part.split("=")[0]?.trim();
		if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
	}
}

afterEach(() => {
	cleanup();
	clearDocumentCookies();
	localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
	vi.restoreAllMocks();
});

describe("PublicHeader", () => {
	it.each([
		["vi", "Đăng ký miễn phíĐăng ký", "Điều hướng"],
		["en", "Sign up freeSign up", "Navigation"],
		["zh-CN", "免费注册注册", "站点导航"],
	] as const)(
		"shows the mark, the name and the sign-up pill (full and phone forms) in %s",
		(locale, signIn, nav) => {
			render(
				<PublicHeader
					brand={BRAND}
					locale={locale}
					signInHref="/login"
					navLinks={[
						{ href: "#features", label: "Features", dataId: "topbar-features" },
					]}
				/>,
			);
			const home = byDataId("public-home");
			expect(home.getAttribute("href")).toBe("/");
			expect(home.textContent).toBe("Scribe");
			const mark = home.querySelector("img");
			expect(mark?.getAttribute("src")).toBe("/brand/mark-64.webp");
			expect(mark?.getAttribute("width")).toBe("24");
			expect(mark?.getAttribute("alt")).toBe("");
			const pill = byDataId("public-sign-in");
			expect(pill.textContent).toBe(signIn);
			expect(pill.getAttribute("href")).toBe("/login");
			expect(screen.getByRole("navigation", { name: nav })).toBeTruthy();
			expect(byDataId("topbar-features").getAttribute("href")).toBe(
				"#features",
			);
		},
	);

	it("marks the current page and the pill on /login", () => {
		render(
			<PublicHeader
				brand={BRAND}
				locale="en"
				signInHref="/login"
				signInCurrent
				navLinks={[
					{
						href: "/docs",
						label: "Docs",
						dataId: "topbar-docs",
						current: true,
						hideOnPhones: true,
					},
				]}
			/>,
		);
		expect(byDataId("public-sign-in").getAttribute("aria-current")).toBe(
			"page",
		);
		const docs = byDataId("topbar-docs");
		expect(docs.getAttribute("aria-current")).toBe("page");
		expect(docs.className).toContain("shell-hide-phone");
	});

	it("puts the account slot in place of the sign-in pill", () => {
		render(
			<PublicHeader
				brand={BRAND}
				locale="vi"
				signInHref="/login"
				accountSlot={
					<a href="/app" data-id="topbar-open-app">
						Mở app
					</a>
				}
			/>,
		);
		expect(document.querySelector('[data-id="public-sign-in"]')).toBeNull();
		expect(byDataId("topbar-open-app").textContent).toBe("Mở app");
		expect(screen.queryByRole("navigation")).toBeNull();
	});

	it("hands sign-in to onSignIn instead of following the link", () => {
		const onSignIn = vi.fn();
		render(
			<PublicHeader
				brand={BRAND}
				locale="en"
				signInHref="https://auth.hoandat.com/authorize"
				onSignIn={onSignIn}
			/>,
		);
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		byDataId("public-sign-in").dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
		expect(onSignIn).toHaveBeenCalledWith("https://auth.hoandat.com/authorize");
	});

	it("renders the app's own paths with its link component, other URLs as <a>", () => {
		const seen: string[] = [];
		function RouterLink(props: ShellAnchorProps) {
			seen.push(props.href);
			return <a {...props} data-router="true" />;
		}
		render(
			<PublicHeader
				brand={BRAND}
				locale="en"
				signInHref="https://auth.hoandat.com/authorize"
				navLinks={[{ href: "/docs", label: "Docs", dataId: "topbar-docs" }]}
				linkComponent={RouterLink}
			/>,
		);
		expect(seen.sort()).toEqual(["/", "/docs"]);
		expect(byDataId("topbar-docs").getAttribute("data-router")).toBe("true");
		expect(byDataId("public-sign-in").hasAttribute("data-router")).toBe(false);
	});
});

describe("PublicFooter", () => {
	it.each([
		[
			"vi",
			["Một app của hoandat.com", "Quyền riêng tư", "Điều khoản", "Tài liệu"],
		],
		["en", ["An app from hoandat.com", "Privacy", "Terms", "Tài liệu"]],
		["zh-CN", ["hoandat.com 旗下应用", "隐私政策", "使用条款", "Tài liệu"]],
	] as const)(
		"shows the switches, then the shared links in %s",
		(locale, labels) => {
			render(
				<PublicFooter
					brand={BRAND}
					locale={locale}
					onLocaleChange={() => {}}
					footerLinks={[
						{ href: "/docs", label: "Tài liệu", dataId: "foot-docs" },
					]}
				/>,
			);
			const footer = byDataId("public-footer");
			const switches = footer.firstElementChild;
			expect(switches?.querySelector('[data-id="lang-switch"]')).toBeTruthy();
			expect(switches?.querySelector('[data-id="theme-switch"]')).toBeTruthy();
			const links = within(footer).getAllByRole("link");
			expect(links.map((link) => link.textContent)).toEqual(labels);
			expect(links.map((link) => link.getAttribute("href"))).toEqual([
				"https://hoandat.com",
				"/privacy",
				"/terms",
				"/docs",
			]);
			expect(byDataId("foot-home")).toBe(links[0]);
		},
	);

	it("takes the app's privacy and terms paths", () => {
		render(
			<PublicFooter
				brand={BRAND}
				locale="en"
				onLocaleChange={() => {}}
				privacyHref="/legal/privacy"
				termsHref="/legal/terms"
			/>,
		);
		expect(byDataId("foot-privacy").getAttribute("href")).toBe(
			"/legal/privacy",
		);
		expect(byDataId("foot-terms").getAttribute("href")).toBe("/legal/terms");
	});

	it("leaves terms out for an app without them", () => {
		render(
			<PublicFooter
				brand={BRAND}
				locale="en"
				onLocaleChange={() => {}}
				termsHref={null}
			/>,
		);
		expect(document.querySelector('[data-id="foot-terms"]')).toBeNull();
		expect(byDataId("foot-privacy").getAttribute("href")).toBe("/privacy");
	});
});

describe("LanguageSwitch", () => {
	it.each(["vi", "en"] as const)(
		"marks %s as current and stores a pick",
		(locale) => {
			const onLocaleChange = vi.fn();
			render(
				<LanguageSwitch
					locale={locale}
					domain="hoandat.com"
					onLocaleChange={onLocaleChange}
				/>,
			);
			const group = screen.getByRole("group", {
				name: locale === "vi" ? "Ngôn ngữ" : "Language",
			});
			const buttons = within(group).getAllByRole("button");
			expect(buttons.map((button) => button.textContent)).toEqual([
				"Tiếng Việt",
				"English",
			]);
			expect(byDataId(`lang-${locale}`).getAttribute("aria-pressed")).toBe(
				"true",
			);
			const other: ShellLocale = locale === "vi" ? "en" : "vi";
			expect(byDataId(`lang-${other}`).getAttribute("aria-pressed")).toBe(
				"false",
			);
			fireEvent.click(byDataId(`lang-${other}`));
			expect(onLocaleChange).toHaveBeenCalledWith(other);
			expect(document.cookie).toContain(`hd_lang=${other}`);
		},
	);

	it("renders links to the app's language URL without script", () => {
		render(
			<LanguageSwitch
				locale="en"
				domain="hoandat.com"
				languageHref={(locale) => `/lang?set=${locale}&return=%2F`}
			/>,
		);
		const nav = screen.getByRole("navigation", { name: "Language" });
		const links = within(nav).getAllByRole("link");
		expect(links.map((link) => link.getAttribute("href"))).toEqual([
			"/lang?set=vi&return=%2F",
			"/lang?set=en&return=%2F",
		]);
		expect(byDataId("lang-en").getAttribute("aria-current")).toBe("true");
		expect(byDataId("lang-vi").hasAttribute("aria-current")).toBe(false);
		expect(byDataId("lang-vi").getAttribute("hreflang")).toBe("vi");
	});

	it("shows only the app's languages, in its order, and stores zh-CN", () => {
		const onLocaleChange = vi.fn();
		render(
			<LanguageSwitch
				locale="zh-CN"
				locales={["en", "zh-CN", "vi"]}
				domain="hoandat.com"
				onLocaleChange={onLocaleChange}
			/>,
		);
		const group = screen.getByRole("group", { name: "语言" });
		expect(
			within(group)
				.getAllByRole("button")
				.map((button) => button.textContent),
		).toEqual(["English", "中文", "Tiếng Việt"]);
		expect(byDataId("lang-zh-CN").getAttribute("aria-pressed")).toBe("true");
		expect(byDataId("lang-zh-CN").getAttribute("lang")).toBe("zh-CN");
		fireEvent.click(byDataId("lang-en"));
		expect(onLocaleChange).toHaveBeenCalledWith("en");
		fireEvent.click(byDataId("lang-zh-CN"));
		expect(onLocaleChange).toHaveBeenLastCalledWith("zh-CN");
		expect(document.cookie).toContain("hd_lang=zh-CN");
	});

	it("has no Chinese option in an app without it", () => {
		render(
			<LanguageSwitch
				locale="vi"
				domain="hoandat.com"
				onLocaleChange={() => {}}
			/>,
		);
		expect(document.querySelector('[data-id="lang-zh-CN"]')).toBeNull();
	});
});

describe("ThemeSwitch", () => {
	it.each([
		["vi", "Giao diện", ["Sáng", "Tối", "Theo máy"]],
		["en", "Theme", ["Light", "Dark", "System"]],
		["zh-CN", "颜色模式", ["浅色主题", "深色主题", "跟随系统"]],
	] as const)(
		"names the switch and its options in %s",
		(locale, legend, labels) => {
			render(<ThemeSwitch locale={locale} domain="hoandat.com" />);
			const group = screen.getByRole("group", { name: legend });
			const buttons = within(group).getAllByRole("button");
			expect(
				buttons.map((button) => button.getAttribute("aria-label")),
			).toEqual(labels);
			expect(byDataId("theme-system").getAttribute("aria-pressed")).toBe(
				"true",
			);
		},
	);

	it("stores and applies a pick, and every switch on the page follows", () => {
		render(
			<>
				<ThemeSwitch locale="en" domain="hoandat.com" />
				<div data-id="second">
					<ThemeSwitch locale="en" domain="hoandat.com" />
				</div>
			</>,
		);
		fireEvent.click(
			screen.getAllByRole("button", { name: "Dark" })[0] as HTMLElement,
		);
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(document.cookie).toContain("hd_theme=dark");
		const second = within(byDataId("second"));
		expect(
			second.getByRole("button", { name: "Dark" }).getAttribute("aria-pressed"),
		).toBe("true");
		fireEvent.click(second.getByRole("button", { name: "System" }));
		expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
		expect(
			screen
				.getAllByRole("button", { pressed: true })
				.map((b) => b.getAttribute("aria-label")),
		).toEqual(["System", "System"]);
	});

	it("shows the app's legacy choice until a shared one exists", () => {
		localStorage.setItem("localman-theme", "light");
		render(
			<ThemeSwitch
				locale="en"
				domain="hoandat.com"
				legacyThemeKey="localman-theme"
			/>,
		);
		expect(byDataId("theme-light").getAttribute("aria-pressed")).toBe("true");
	});

	it("follows a choice made in another app when the page comes back into view", () => {
		render(<ThemeSwitch locale="en" domain="hoandat.com" />);
		document.cookie = "hd_theme=dark; Path=/";
		expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
		act(() => {
			window.dispatchEvent(new Event("focus"));
		});
		expect(byDataId("theme-dark").getAttribute("aria-pressed")).toBe("true");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("does not touch data-theme on mount (the head script set it)", () => {
		document.documentElement.setAttribute("data-theme", "dark");
		render(<ThemeSwitch locale="en" domain="hoandat.com" />);
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});
});

describe("SignInCard", () => {
	it.each([
		["vi", "Đăng nhập bằng hoandat.com", "Google, GitHub hoặc Apple"],
		["en", "Sign in with hoandat.com", "Google, GitHub or Apple"],
		["zh-CN", "使用 hoandat.com 登录", "Google、GitHub 或 Apple"],
	] as const)("has one call to action in %s", (locale, cta, note) => {
		render(
			<SignInCard
				brand={BRAND}
				locale={locale}
				signInHref="/auth/start"
				title="Scribe"
				description="Ghi và chép lời cuộc họp."
			>
				<p data-id="sign-in-error">Lỗi</p>
			</SignInCard>,
		);
		const card = byDataId("sign-in-card");
		expect(within(card).getByRole("heading", { level: 1 }).textContent).toBe(
			"Scribe",
		);
		const links = within(card).getAllByRole("link");
		expect(links).toHaveLength(1);
		expect(links[0]?.textContent).toBe(cta);
		expect(links[0]?.getAttribute("href")).toBe("/auth/start");
		expect(byDataId("sign-in-cta")).toBe(links[0]);
		expect(card.textContent).toContain(note);
		expect(card.textContent).toContain("Ghi và chép lời cuộc họp.");
		expect(byDataId("sign-in-error")).toBeTruthy();
	});

	it("is an h2 beside a hero and hands sign-in to onSignIn", () => {
		const onSignIn = vi.fn();
		render(
			<SignInCard
				brand={BRAND}
				locale="en"
				signInHref="https://auth.hoandat.com/x"
				title="Chat"
				headingLevel={2}
				onSignIn={onSignIn}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Chat");
		fireEvent.click(byDataId("sign-in-cta"));
		expect(onSignIn).toHaveBeenCalledWith("https://auth.hoandat.com/x");
	});

	it("is busy and ignores clicks while sign-in is pending, label unchanged", () => {
		const onSignIn = vi.fn();
		const card = (pending: boolean) => (
			<SignInCard
				brand={BRAND}
				locale="vi"
				signInHref="https://auth.hoandat.com/x"
				title="Chat"
				onSignIn={onSignIn}
				pending={pending}
			/>
		);
		const { rerender } = render(card(true));
		const cta = byDataId("sign-in-cta");
		expect(cta.getAttribute("aria-busy")).toBe("true");
		expect(cta.getAttribute("aria-disabled")).toBe("true");
		expect(cta.textContent).toBe("Đăng nhập bằng hoandat.com");
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		cta.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
		expect(onSignIn).not.toHaveBeenCalled();

		rerender(card(false));
		expect(cta.hasAttribute("aria-busy")).toBe(false);
		expect(cta.hasAttribute("aria-disabled")).toBe(false);
		fireEvent.click(cta);
		expect(onSignIn).toHaveBeenCalledTimes(1);
	});

	it("blocks a plain link while pending (no onSignIn)", () => {
		render(
			<SignInCard
				brand={BRAND}
				locale="en"
				signInHref="/api/auth/login"
				title="Scribe"
				pending
			/>,
		);
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		byDataId("sign-in-cta").dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});
});

describe("Hero and FeatureList", () => {
	it("lays the intro beside the aside", () => {
		render(
			<Hero
				eyebrow="Scribe"
				title="Chép lời cuộc họp"
				lede="Tiếng Việt, có người nói."
				aside={<div data-id="aside">card</div>}
			>
				<ul data-id="checks" />
			</Hero>,
		);
		const hero = byDataId("hero");
		expect(hero.className).toBe("shell-hero shell-hero-split");
		expect(within(hero).getByRole("heading", { level: 1 }).textContent).toBe(
			"Chép lời cuộc họp",
		);
		expect(hero.textContent).toContain("Tiếng Việt, có người nói.");
		expect(byDataId("checks")).toBeTruthy();
		expect(byDataId("aside").parentElement?.className).toBe("shell-hero-aside");
	});

	it("is one column without an aside", () => {
		render(<Hero title="Tiêu đề" />);
		expect(byDataId("hero").className).toBe("shell-hero");
		expect(byDataId("hero").querySelector(".shell-eyebrow")).toBeNull();
	});

	it("lists the features as cards under a heading", () => {
		render(
			<FeatureList
				id="features"
				title="Làm được gì"
				items={[
					{ id: "record", title: "Ghi âm", description: "Ghi trên web." },
					{ id: "search", title: "Tìm kiếm", description: "Tìm mọi lời." },
				]}
			/>,
		);
		const section = byDataId("features");
		expect(section.id).toBe("features");
		expect(within(section).getByRole("heading", { level: 2 }).textContent).toBe(
			"Làm được gì",
		);
		expect(within(section).getAllByRole("listitem")).toHaveLength(2);
		expect(byDataId("feature-search").textContent).toBe("Tìm kiếmTìm mọi lời.");
	});

	it("takes a data-id per list, so two lists on a page differ", () => {
		render(
			<>
				<FeatureList
					items={[{ id: "record", title: "Ghi âm", description: "Web." }]}
				/>
				<FeatureList
					dataId="features-mobile"
					items={[{ id: "offline", title: "Ngoại tuyến", description: "App." }]}
				/>
			</>,
		);
		expect(document.querySelectorAll('[data-id="features"]')).toHaveLength(1);
		expect(
			within(byDataId("features-mobile")).getAllByRole("listitem"),
		).toHaveLength(1);
		expect(byDataId("feature-record").closest("section")).toBe(
			byDataId("features"),
		);
	});
});

describe("PublicPage", () => {
	it("is header, main with the body, footer", () => {
		render(
			<PublicPage
				brand={BRAND}
				locale="vi"
				signInHref="/login"
				onLocaleChange={() => {}}
				layout="center"
			>
				<p data-id="body">Nội dung</p>
			</PublicPage>,
		);
		const root = byDataId("public-header").parentElement;
		expect(root?.className).toBe("shell");
		expect([...(root?.children ?? [])].map((child) => child.tagName)).toEqual([
			"A",
			"HEADER",
			"MAIN",
			"FOOTER",
		]);
		expect(screen.getByRole("main").className).toBe(
			"shell-main shell-container shell-main-center",
		);
		expect(byDataId("body").closest("main")).toBeTruthy();
		expect(byDataId("public-footer")).toBeTruthy();
	});

	it.each([
		["vi", "Bỏ qua tới nội dung"],
		["en", "Skip to content"],
		["zh-CN", "跳到主要内容"],
	] as const)(
		"starts with a skip link to the focusable main in %s",
		(locale, label) => {
			render(
				<PublicPage
					brand={BRAND}
					locale={locale}
					signInHref="/login"
					onLocaleChange={() => {}}
				>
					<p>Nội dung</p>
				</PublicPage>,
			);
			const skip = byDataId("skip-link");
			expect(skip.parentElement?.firstElementChild).toBe(skip);
			expect(skip.textContent).toBe(label);
			expect(skip.getAttribute("href")).toBe("#main");
			const main = screen.getByRole("main");
			expect(main.id).toBe("main");
			expect(main.tabIndex).toBe(-1);
			main.focus();
			expect(document.activeElement).toBe(main);
		},
	);

	it("takes the app's id for main", () => {
		render(
			<PublicPage
				brand={BRAND}
				locale="en"
				signInHref="/login"
				onLocaleChange={() => {}}
				mainId="content"
			>
				<p>Body</p>
			</PublicPage>,
		);
		expect(byDataId("skip-link").getAttribute("href")).toBe("#content");
		expect(screen.getByRole("main").id).toBe("content");
	});

	it("passes the app's languages to the footer switch", () => {
		render(
			<PublicPage
				brand={BRAND}
				locale="en"
				locales={["en", "zh-CN", "vi"]}
				signInHref="/login"
				onLocaleChange={() => {}}
			>
				<p>Body</p>
			</PublicPage>,
		);
		const group = screen.getByRole("group", { name: "Language" });
		expect(
			within(group)
				.getAllByRole("button")
				.map((button) => button.textContent),
		).toEqual(["English", "中文", "Tiếng Việt"]);
	});
});
