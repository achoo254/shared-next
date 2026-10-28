// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppSwitcher, type AppSwitcherProps } from "../src/app-switcher.js";

const BASE: AppSwitcherProps = {
	current: "scribe",
	domain: "hoandat.com",
	locale: "en",
};

function setup(props: Partial<AppSwitcherProps> = {}) {
	const view = render(
		<div>
			<button type="button">outside</button>
			<AppSwitcher {...BASE} {...props} />
		</div>,
	);
	const button = screen.getByRole("button", { name: "Switch app" });
	return { ...view, button };
}

/** The panel the switcher button controls (found while closed, too). */
function panel(): HTMLDialogElement {
	const id = document
		.querySelector(".sn-app-switcher__button")
		?.getAttribute("aria-controls");
	const element = id ? document.getElementById(id) : null;
	if (!(element instanceof HTMLDialogElement)) throw new Error("no <dialog>");
	return element;
}

/** Runs the page as an installed PWA, or in a browser tab. */
function displayStandalone(standalone: boolean): void {
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: standalone && query === "(display-mode: standalone)",
		media: query,
		addEventListener: () => {},
		removeEventListener: () => {},
	}));
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("AppSwitcher", () => {
	it("starts closed, with the panel wired to the button", () => {
		const { button } = setup();
		expect(button.getAttribute("aria-haspopup")).toBe("dialog");
		expect(button.getAttribute("aria-expanded")).toBe("false");
		expect(button.getAttribute("aria-controls")).toBe(panel().id);
		expect(panel().open).toBe(false);
	});

	it("opens on click, lists the other apps and focuses the first link", () => {
		const { button } = setup();
		fireEvent.click(button);
		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(panel().open).toBe(true);
		expect(screen.getByRole("dialog", { name: "Apps" })).toBe(panel());
		const links = within(panel()).getAllByRole("link");
		expect(links.map((link) => link.textContent)).toEqual([
			"ChatFast messaging with searchable history and bots.",
			"LocalmanMock APIs and an API client in your browser.",
			"TuneloYour tunnels in the browser.",
			"Web NhanhA website from a template, published at its own address.",
			"Tiểu ĐệAn AI bot that does small writing jobs for free and lives on voluntary tips.",
			"Manage your accountSign-in, devices and app access.",
		]);
		expect(links[0]?.getAttribute("href")).toBe(
			"https://chat.hoandat.com/?utm_source=scribe&utm_medium=app_switcher",
		);
		expect(document.activeElement).toBe(links[0]);
	});

	it("closes on Escape and gives focus back to the button", () => {
		const { button } = setup();
		fireEvent.click(button);
		fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
		expect(button.getAttribute("aria-expanded")).toBe("false");
		expect(panel().open).toBe(false);
		expect(document.activeElement).toBe(button);
	});

	it("keeps Tab and Shift+Tab inside the open panel", () => {
		const { button } = setup();
		fireEvent.click(button);
		const links = within(panel()).getAllByRole("link");
		const first = links[0];
		const last = links.at(-1);
		last?.focus();
		fireEvent.keyDown(last ?? document, { key: "Tab" });
		expect(document.activeElement).toBe(first);
		fireEvent.keyDown(first ?? document, { key: "Tab", shiftKey: true });
		expect(document.activeElement).toBe(last);
	});

	it("closes on a press outside, not on a press inside", () => {
		const { button } = setup();
		fireEvent.click(button);
		fireEvent.pointerDown(panel());
		expect(panel().open).toBe(true);
		fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));
		expect(panel().open).toBe(false);
		expect(button.getAttribute("aria-expanded")).toBe("false");
	});

	it("toggles closed with a second click", () => {
		const { button } = setup();
		fireEvent.click(button);
		fireEvent.click(button);
		expect(panel().open).toBe(false);
	});

	it("hands the URL to onOpen instead of following the link", () => {
		const onOpen = vi.fn();
		const { button } = setup({ onOpen });
		fireEvent.click(button);
		const account = within(panel()).getByRole("link", {
			name: /Manage your account/,
		});
		const followed = fireEvent.click(account);
		expect(followed).toBe(false);
		expect(onOpen).toHaveBeenCalledWith(
			"https://auth.hoandat.com/account?utm_source=scribe&utm_medium=app_switcher",
		);
		expect(panel().open).toBe(false);
	});

	it("gives focus back to the button after handing a link to onOpen", () => {
		const onOpen = vi.fn();
		const { button } = setup({ onOpen });
		fireEvent.click(button);
		const chat = within(panel()).getByRole("link", { name: /Chat/ });
		expect(document.activeElement).toBe(chat);
		fireEvent.click(chat);
		expect(onOpen).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(button);
	});

	it("opens links in a new browsing context in an installed PWA", () => {
		displayStandalone(true);
		const { button } = setup();
		fireEvent.click(button);
		for (const link of within(panel()).getAllByRole("link")) {
			expect(link.getAttribute("target")).toBe("_blank");
			expect(link.getAttribute("rel")).toBe("noopener");
		}
	});

	it("keeps links in the same tab in a browser, or when onOpen handles them", () => {
		displayStandalone(false);
		const { button, unmount } = setup();
		fireEvent.click(button);
		for (const link of within(panel()).getAllByRole("link")) {
			expect(link.hasAttribute("target")).toBe(false);
			expect(link.hasAttribute("rel")).toBe(false);
		}
		unmount();
		displayStandalone(true);
		setup({ onOpen: vi.fn() });
		for (const link of within(panel()).getAllByRole("link", { hidden: true })) {
			expect(link.hasAttribute("target")).toBe(false);
		}
	});

	it("lets a plain link navigate when there is no onOpen", () => {
		const { button } = setup();
		fireEvent.click(button);
		const chat = within(panel()).getByRole("link", { name: /Chat/ });
		// Runs after React's handlers (they listen on the render root): record
		// whether the component cancelled the click, then stop jsdom, which
		// cannot navigate, from trying.
		let cancelled: boolean | undefined;
		const afterReact = (event: Event) => {
			cancelled = event.defaultPrevented;
			event.preventDefault();
		};
		document.addEventListener("click", afterReact);
		fireEvent.click(chat);
		document.removeEventListener("click", afterReact);
		expect(cancelled).toBe(false);
		expect(panel().open).toBe(false);
	});

	it("speaks the app's language and opens beside a rail", () => {
		const { container } = render(
			<AppSwitcher {...BASE} locale="vi" placement="right-end" />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Chuyển ứng dụng" }));
		expect(screen.getByRole("dialog", { name: "Ứng dụng" })).toBe(panel());
		expect(
			container
				.querySelector(".sn-app-switcher")
				?.getAttribute("data-placement"),
		).toBe("right-end");
	});

	it("renders nothing and logs when the domain is wrong", () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const { container } = render(
			<AppSwitcher {...BASE} domain="localhost:5173" />,
		);
		expect(container.innerHTML).toBe("");
		expect(log).toHaveBeenCalledWith(
			expect.objectContaining({
				message: expect.stringContaining("is not a root domain"),
			}),
		);
	});
});
