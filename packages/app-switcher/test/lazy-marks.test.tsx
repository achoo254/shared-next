// @vitest-environment jsdom
/**
 * The marks load in their own chunk: none is shown until the button is
 * hovered, focused or opened; a sized placeholder holds each place.
 * Own file, so the module-level mark cache starts empty.
 */
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppSwitcher } from "../src/app-switcher.js";

afterEach(cleanup);

describe("lazy app marks", () => {
	it("shows placeholders first, then the marks once the button is hovered", async () => {
		render(<AppSwitcher current="scribe" domain="hoandat.com" locale="en" />);
		const button = screen.getByRole("button", { name: "Switch app" });
		const links = () =>
			Array.from(document.querySelectorAll(".sn-app-switcher__link"));

		expect(links()).toHaveLength(5);
		for (const link of links()) {
			expect(link.querySelector("img")).toBeNull();
			const placeholder = link.querySelector(".sn-app-switcher__icon");
			expect(placeholder?.tagName).toBe("SPAN");
			expect(placeholder?.getAttribute("aria-hidden")).toBe("true");
		}

		fireEvent.pointerEnter(button);
		await waitFor(() =>
			expect(
				document.querySelectorAll("img.sn-app-switcher__icon"),
			).toHaveLength(5),
		);
		for (const link of links()) {
			const mark = link.querySelector("img");
			expect(mark?.getAttribute("alt")).toBe("");
			expect(mark?.getAttribute("src")).toMatch(/^data:image\/webp;base64,/);
		}
	});
});
