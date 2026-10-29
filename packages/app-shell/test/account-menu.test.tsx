import { readFileSync } from "node:fs";
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	AccountMenu,
	type AccountMenuProps,
	type ShellAnchorProps,
} from "../src/index.js";

const IDP = "https://auth.hoandat.com/account";

function menu(overrides: Partial<AccountMenuProps> = {}): AccountMenuProps {
	return {
		user: {
			name: "Minh Anh",
			email: "minh@example.com",
			picture: "https://lh3.googleusercontent.com/a/x",
		},
		locale: "vi",
		domain: "hoandat.com",
		idpAccountUrl: IDP,
		signOut: { onClick: () => {} },
		...overrides,
	};
}

function byDataId(id: string): HTMLElement {
	const element = document.querySelector<HTMLElement>(`[data-id="${id}"]`);
	if (!element) throw new Error(`no [data-id="${id}"]`);
	return element;
}

const details = (): HTMLDetailsElement =>
	byDataId("account-menu") as HTMLDetailsElement;

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("AccountMenu", () => {
	it("shows the picture and name, then name and email in the menu", () => {
		render(<AccountMenu {...menu()} />);
		const trigger = byDataId("topbar-account");
		expect(trigger.getAttribute("aria-label")).toBe("Minh Anh · Tài khoản");
		expect(trigger.querySelector("img")?.getAttribute("src")).toBe(
			"https://lh3.googleusercontent.com/a/x",
		);
		expect(trigger.textContent).toBe("Minh Anh");
		expect(screen.getByText("minh@example.com")).toBeTruthy();
	});

	it("draws the first letter when there is no https picture", () => {
		render(
			<AccountMenu
				{...menu({ user: { name: "Ánh", picture: "http://x/a.png" } })}
			/>,
		);
		const trigger = byDataId("topbar-account");
		expect(trigger.querySelector("img")).toBeNull();
		expect(
			trigger.querySelector("[data-initial]")?.getAttribute("data-initial"),
		).toBe("A");
	});

	it("falls back to the email, then to the word Account", () => {
		const { rerender } = render(
			<AccountMenu {...menu({ user: { email: "a@b.vn" } })} />,
		);
		expect(byDataId("topbar-account").textContent).toBe("a@b.vn");
		rerender(<AccountMenu {...menu({ user: {}, locale: "en" })} />);
		expect(byDataId("topbar-account").textContent).toBe("Account");
	});

	it("links the IdP sections in a new tab, or leaves them out", () => {
		const { rerender } = render(<AccountMenu {...menu()} />);
		const email = byDataId("account-menu-idp-email") as HTMLAnchorElement;
		expect(email.href).toBe(`${IDP}#account-email`);
		expect(email.target).toBe("_blank");
		expect(
			(byDataId("account-menu-idp-sign-in") as HTMLAnchorElement).href,
		).toBe(`${IDP}#account-sign-in`);
		rerender(<AccountMenu {...menu({ idpAccountUrl: null })} />);
		expect(document.querySelector('[data-id^="account-menu-idp-"]')).toBeNull();
	});

	it("hands IdP links to onOpenExternal in a native shell", () => {
		const open = vi.fn();
		render(<AccountMenu {...menu({ onOpenExternal: open })} />);
		fireEvent.click(byDataId("account-menu-idp-email"));
		expect(open).toHaveBeenCalledWith(`${IDP}#account-email`);
	});

	it("renders the app's entries through its router link and closes on a pick", () => {
		const onClick = vi.fn();
		const Link = ({ href, ...rest }: ShellAnchorProps) => (
			<a href={href} data-router="" {...rest} />
		);
		render(
			<AccountMenu
				{...menu({
					linkComponent: Link,
					entries: [
						[
							{
								label: "Cài đặt",
								dataId: "account-menu-settings",
								href: "/settings",
							},
						],
						[{ label: "Góp ý", dataId: "account-menu-feedback", onClick }],
					],
				})}
			/>,
		);
		details().open = true;
		expect(byDataId("account-menu-settings").hasAttribute("data-router")).toBe(
			true,
		);
		fireEvent.click(byDataId("account-menu-feedback"));
		expect(onClick).toHaveBeenCalledOnce();
		expect(details().open).toBe(false);
	});

	it("signs out by callback, disabled while busy", () => {
		const onClick = vi.fn();
		const { rerender } = render(
			<AccountMenu {...menu({ signOut: { onClick } })} />,
		);
		fireEvent.click(byDataId("account-menu-sign-out"));
		expect(onClick).toHaveBeenCalledOnce();
		rerender(<AccountMenu {...menu({ signOut: { onClick, busy: true } })} />);
		expect(
			(byDataId("account-menu-sign-out") as HTMLButtonElement).disabled,
		).toBe(true);
	});

	it("signs out by a POST form with its hidden fields", () => {
		render(
			<AccountMenu
				{...menu({ signOut: { action: "/logout", fields: { csrf: "t" } } })}
			/>,
		);
		const form = byDataId("account-menu-sign-out").closest("form");
		expect(form?.getAttribute("method")).toBe("post");
		expect(form?.getAttribute("action")).toBe("/logout");
		expect(
			form?.querySelector<HTMLInputElement>('input[name="csrf"]')?.value,
		).toBe("t");
	});

	it("closes on an outside click and on Escape", () => {
		render(
			<>
				<AccountMenu {...menu()} />
				<p data-id="outside">x</p>
			</>,
		);
		details().open = true;
		fireEvent.pointerDown(byDataId("outside"));
		expect(details().open).toBe(false);
		details().open = true;
		fireEvent.keyDown(document, { key: "Escape" });
		expect(details().open).toBe(false);
		expect(document.activeElement).toBe(byDataId("topbar-account"));
	});
});

describe("AccountMenu on a server-rendered page", () => {
	it("is closed by app-shell-enhance.js with no React in the page", async () => {
		const html = renderToStaticMarkup(
			<AccountMenu
				{...menu({ signOut: { action: "/logout", fields: { csrf: "t" } } })}
			/>,
		);
		const dom = new JSDOM(
			`<!DOCTYPE html><html><body>${html}<p id="out">x</p></body></html>`,
			{ url: "https://tunelo.hoandat.com/", runScripts: "outside-only" },
		);
		dom.window.eval(
			readFileSync(
				`${import.meta.dirname}/../dist/app-shell-enhance.js`,
				"utf8",
			),
		);
		const page = dom.window.document;
		if (page.readyState === "loading") {
			await new Promise((resolve) =>
				page.addEventListener("DOMContentLoaded", resolve, { once: true }),
			);
		}
		const element = page.querySelector<HTMLDetailsElement>(
			'details[data-id="account-menu"]',
		);
		if (!element) throw new Error("no menu");
		element.open = true;
		page
			.getElementById("out")
			?.dispatchEvent(new dom.window.Event("pointerdown", { bubbles: true }));
		expect(element.open).toBe(false);
	});
});
