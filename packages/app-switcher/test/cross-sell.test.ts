import { describe, expect, it } from "vitest";
import { APP_SWITCHER_APP_IDS, APP_SWITCHER_CATALOG } from "../src/catalog.js";
import {
	CROSS_SELL_FALLBACK,
	CROSS_SELL_PAIRS,
	crossSellHref,
	crossSellSuggestion,
} from "../src/cross-sell.js";
import { appSwitcherLinks } from "../src/links.js";

const APP_IDS: string[] = APP_SWITCHER_CATALOG.map((entry) => entry.id).filter(
	(id) => id !== "account",
);

describe("crossSellSuggestion", () => {
	it("pairs each app with one other app", () => {
		expect(
			Object.fromEntries(APP_IDS.map((id) => [id, crossSellSuggestion(id)])),
		).toEqual({
			webnhanh: "kb",
			chat: "clip",
			tieude: "webnhanh",
			scribe: "webnhanh",
			localman: "webnhanh",
			tunelo: "webnhanh",
			tuvi: "clip",
			clip: "tuvi",
			lockin: "webnhanh",
			chuanho: "miu",
			miu: "chuanho",
			kb: "webnhanh",
		});
	});

	it("never suggests the app itself, and only catalog apps", () => {
		for (const id of APP_IDS) {
			const suggestion = crossSellSuggestion(id);
			expect(suggestion).not.toBe(id);
			expect(APP_IDS).toContain(suggestion);
		}
		for (const [origin, target] of Object.entries(CROSS_SELL_PAIRS)) {
			expect(APP_IDS).toContain(origin);
			expect(target).not.toBe(origin);
		}
	});

	it("falls back for an unknown or missing origin, never an inherited key", () => {
		for (const origin of [undefined, "", "account", "toString", "nope"]) {
			expect(crossSellSuggestion(origin)).toBe(CROSS_SELL_FALLBACK);
		}
	});
});

describe("crossSellHref", () => {
	it("tags a link, replacing the tags it had", () => {
		expect(
			crossSellHref(
				"https://lockin.hoandat.com/?utm_source=x&page=2",
				"tuvi",
				"welcome",
			),
		).toBe(
			"https://lockin.hoandat.com/?utm_source=cross_sell&page=2&utm_medium=welcome&utm_campaign=tuvi",
		);
	});

	it("throws on a relative link", () => {
		expect(() => crossSellHref("/lockin", "tuvi", "welcome")).toThrow();
	});
});

describe("appSwitcherLinks suggestion", () => {
	it.each(APP_SWITCHER_APP_IDS)("marks exactly one app for %s", (current) => {
		const links = appSwitcherLinks({
			current,
			domain: "hoandat.com",
			locale: "en",
		});
		const suggested = links.filter((link) => link.suggested);
		expect(suggested.map((link) => link.id)).toEqual([
			crossSellSuggestion(current),
		]);
	});

	it("marks none when asked not to suggest", () => {
		const links = appSwitcherLinks({
			current: "chat",
			domain: "hoandat.com",
			locale: "en",
			suggest: false,
		});
		expect(links.some((link) => link.suggested)).toBe(false);
		expect(links.find((link) => link.id === "clip")?.href).toBe(
			"https://clip.hoandat.com/?utm_source=chat&utm_medium=app_switcher",
		);
	});
});
