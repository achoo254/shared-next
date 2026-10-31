// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountValueCard, type ShellBrand } from "../src/index.js";

const BRAND: ShellBrand = {
	appName: "Tử Vi",
	domain: "hoandat.com",
	markSrc: "/brand/mark-64.webp",
};

afterEach(cleanup);

describe("AccountValueCard", () => {
	it("lists the app's benefits, then one account for every app, then sign-up", () => {
		const { container } = render(
			<AccountValueCard
				brand={BRAND}
				locale="vi"
				signInHref="/api/auth/login"
				benefits={["Lưu lá số để xem lại", "Quẻ hôm nay mỗi sáng", "a", "b"]}
			/>,
		);
		const items = [...container.querySelectorAll("li")].map(
			(li) => li.textContent,
		);
		expect(items).toEqual([
			"Lưu lá số để xem lại",
			"Quẻ hôm nay mỗi sáng",
			"a",
			"Một tài khoản dùng cho mọi app của hoandat.com",
		]);
		const cta = container.querySelector('[data-id="account-value-cta"]');
		expect(cta?.getAttribute("href")).toBe("/api/auth/login");
		expect(cta?.textContent).toBe("Đăng ký miễn phí");
		expect(container.textContent).toContain(
			"Giữ lại với tài khoản hoandat.com miễn phí",
		);
	});

	it("hands sign-in to the native shell when asked", () => {
		const onSignIn = vi.fn();
		const { container } = render(
			<AccountValueCard
				brand={BRAND}
				locale="en"
				signInHref="/login"
				benefits={["Keep your charts"]}
				onSignIn={onSignIn}
			/>,
		);
		container
			.querySelector<HTMLAnchorElement>('[data-id="account-value-cta"]')
			?.click();
		expect(onSignIn).toHaveBeenCalledWith("/login");
	});
});
