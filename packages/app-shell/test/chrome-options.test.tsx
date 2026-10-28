// @vitest-environment jsdom
/**
 * Footer buttons and note, hiding the sign-in pill, moving the header's
 * links into the footer on phones, and callbacks typed by the app's own
 * languages (checked by `pnpm typecheck`, which includes this file).
 */
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	LanguageSwitch,
	PublicFooter,
	PublicHeader,
	PublicPage,
	type ShellBrand,
} from "../src/index.js";

const BRAND: ShellBrand = {
	appName: "Clip",
	domain: "hoandat.com",
	markSrc: "/brand/mark-64.webp",
};

function byDataId(id: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(`[data-id="${id}"]`);
	if (!element) throw new Error(`no [data-id="${id}"]`);
	return element;
}

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("footer items", () => {
	it("renders a button item in the link row, not a fake # link", () => {
		const onClick = vi.fn();
		render(
			<PublicFooter
				brand={BRAND}
				locale="en"
				onLocaleChange={() => {}}
				footerLinks={[
					{ href: "/docs", label: "Docs", dataId: "foot-docs" },
					{ label: "Feedback", dataId: "foot-feedback", onClick },
				]}
			/>,
		);
		const feedback = byDataId("foot-feedback");
		expect(feedback.tagName).toBe("BUTTON");
		expect(feedback.getAttribute("type")).toBe("button");
		expect(feedback.className).toBe("shell-foot-link");
		expect(feedback.hasAttribute("href")).toBe(false);
		expect(feedback.parentElement).toBe(byDataId("foot-docs").parentElement);
		fireEvent.click(feedback);
		expect(onClick).toHaveBeenCalledTimes(1);
		const row = within(byDataId("public-footer")).getByRole("navigation");
		expect(
			[...row.children].map((child) => child.getAttribute("data-id")),
		).toEqual([
			"foot-home",
			"foot-privacy",
			"foot-terms",
			"foot-docs",
			"foot-feedback",
		]);
	});

	it("shows the app's note under the links, and nothing without one", () => {
		const { rerender } = render(
			<PublicFooter
				brand={BRAND}
				locale="vi"
				onLocaleChange={() => {}}
				footerNote="Nội dung mang tính giải trí, tham khảo."
			/>,
		);
		const note = byDataId("foot-note");
		expect(note.tagName).toBe("P");
		expect(note.className).toBe("shell-foot-note");
		expect(note.textContent).toBe("Nội dung mang tính giải trí, tham khảo.");
		expect(byDataId("public-footer").lastElementChild).toBe(note);
		rerender(
			<PublicFooter brand={BRAND} locale="vi" onLocaleChange={() => {}} />,
		);
		expect(document.querySelector('[data-id="foot-note"]')).toBeNull();
	});
});

describe("account slot", () => {
	it("shows nothing in place of the pill when the slot is null", () => {
		render(
			<PublicHeader
				brand={BRAND}
				locale="vi"
				signInHref="/login"
				accountSlot={null}
			/>,
		);
		expect(document.querySelector('[data-id="public-sign-in"]')).toBeNull();
		expect(byDataId("public-header").textContent).toBe("Clip");
	});

	it("still shows the pill when the slot is left out", () => {
		render(
			<PublicHeader
				brand={BRAND}
				locale="vi"
				signInHref="/login"
				accountSlot={undefined}
			/>,
		);
		expect(byDataId("public-sign-in").textContent).toBe("Đăng nhập");
	});

	it("takes a sign-out form whose button looks like the header links", () => {
		render(
			<PublicHeader
				brand={BRAND}
				locale="en"
				signInHref="/login"
				accountSlot={
					<form className="shell-topbar-form" method="post" action="/logout">
						<button
							className="shell-topbar-link"
							type="submit"
							data-id="sign-out"
						>
							Sign out
						</button>
					</form>
				}
			/>,
		);
		expect(document.querySelector('[data-id="public-sign-in"]')).toBeNull();
		expect(byDataId("sign-out").closest("form")?.className).toBe(
			"shell-topbar-form",
		);
	});
});

describe("hideNavOnPhones", () => {
	const navLinks = [
		{ href: "/tao", label: "Tạo clip", dataId: "nav-create" },
		{ href: "/mau", label: "Mẫu", dataId: "nav-templates", current: true },
	];

	it("hides the header's links on phones and repeats them in the footer there", () => {
		render(
			<PublicPage
				brand={BRAND}
				locale="vi"
				signInHref="/login"
				onLocaleChange={() => {}}
				navLinks={navLinks}
				hideNavOnPhones
				footerLinks={[{ href: "/mau", label: "Mẫu", dataId: "foot-templates" }]}
				accountSlot={
					<button className="shell-topbar-link" type="button">
						Đăng xuất
					</button>
				}
			>
				<p>Body</p>
			</PublicPage>,
		);
		const nav = within(byDataId("public-header")).getByRole("navigation");
		expect(nav.className).toBe("shell-topbar-nav shell-hide-phone");
		const copy = byDataId("foot-nav-create");
		expect(copy.className).toBe("shell-foot-link shell-only-phone");
		expect(copy.getAttribute("href")).toBe("/tao");
		// The footer has /mau already: not twice.
		expect(document.querySelector('[data-id="foot-nav-templates"]')).toBeNull();
		expect(byDataId("foot-templates")).toBeTruthy();
	});

	it("without it, shows the nav on phones and copies nothing to the footer", () => {
		render(
			<PublicPage
				brand={BRAND}
				locale="vi"
				signInHref="/login"
				onLocaleChange={() => {}}
				navLinks={navLinks}
			>
				<p>Body</p>
			</PublicPage>,
		);
		const nav = within(byDataId("public-header")).getByRole("navigation");
		expect(nav.className).toBe("shell-topbar-nav");
		expect(document.querySelector(".shell-only-phone")).toBeNull();
	});
});

describe("onLocaleChange typed by the app's locales", () => {
	type AppLocale = "vi" | "en";
	const LOCALES: readonly AppLocale[] = ["vi", "en"];

	it("takes a vi/en app's own callback and only calls it with its languages", () => {
		const seen: AppLocale[] = [];
		const setLocale = (locale: AppLocale): void => {
			seen.push(locale);
		};
		const locale: AppLocale = "vi";
		render(
			<PublicPage
				brand={BRAND}
				locale={locale}
				locales={LOCALES}
				onLocaleChange={setLocale}
				signInHref="/login"
			>
				<p>Body</p>
			</PublicPage>,
		);
		fireEvent.click(byDataId("lang-en"));
		expect(seen).toEqual(["en"]);
	});

	it("rejects a callback that does not cover the app's languages", () => {
		const onlyVi = (locale: "vi"): void => {
			expect(locale).toBe("vi");
		};
		render(
			<LanguageSwitch
				locale="vi"
				domain="hoandat.com"
				// @ts-expect-error the callback takes vi only, the app has en and zh-CN too
				locales={["vi", "en", "zh-CN"]}
				onLocaleChange={onlyVi}
			/>,
		);
		expect(byDataId("lang-switch").tagName).toBe("FIELDSET");
	});

	it("types languageHref the same way", () => {
		const href = (locale: AppLocale): string => `/lang?set=${locale}`;
		render(
			<LanguageSwitch
				locale="en"
				domain="hoandat.com"
				locales={LOCALES}
				languageHref={href}
			/>,
		);
		expect(byDataId("lang-vi").getAttribute("href")).toBe("/lang?set=vi");
	});
});
