import { describe, expect, it } from "vitest";
import {
	APP_SWITCHER_APP_IDS,
	APP_SWITCHER_CATALOG,
	type AppSwitcherAppId,
} from "../src/catalog.js";
import { appSwitcherLinks, resolveAppSwitcherLocale } from "../src/links.js";

function ids(links: { readonly id: string }[]): string[] {
	return links.map((link) => link.id);
}

describe("appSwitcherLinks", () => {
	it("lists every other app, then the account page", () => {
		const links = appSwitcherLinks({
			current: "localman",
			domain: "hoandat.com",
			locale: "en",
		});
		expect(ids(links)).toEqual([
			"tuvi",
			"miu",
			"webnhanh",
			"chat",
			"tieude",
			"scribe",
			"tunelo",
			"account",
		]);
		expect(links.map((link) => link.href)).toEqual([
			"https://tuvi.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://miu.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://webnhanh.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://chat.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://tieude.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://scribe.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://tunnel.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://auth.hoandat.com/account?utm_source=localman&utm_medium=app_switcher",
		]);
		expect(
			links.filter((link) => link.developer).map((link) => link.id),
		).toEqual(["scribe", "tunelo"]);
	});

	it("builds every host under the domain it is given", () => {
		const links = appSwitcherLinks({
			current: "localman",
			domain: "example.org",
			locale: "vi",
		});
		expect(ids(links)).toEqual([
			"tuvi",
			"miu",
			"webnhanh",
			"chat",
			"tieude",
			"scribe",
			"tunelo",
			"account",
		]);
		expect(links[0]?.href).toBe(
			"https://tuvi.example.org/?utm_source=localman&utm_medium=app_switcher",
		);
		expect(links[1]?.href).toBe(
			"https://miu.example.org/?utm_source=localman&utm_medium=app_switcher",
		);
	});

	it.each(APP_SWITCHER_APP_IDS)(
		"never lists the current app (%s)",
		(current) => {
			const links = appSwitcherLinks({
				current,
				domain: "hoandat.com",
				locale: "en",
			});
			expect(ids(links)).not.toContain(current);
			expect(links).toHaveLength(APP_SWITCHER_CATALOG.length - 1);
			expect(links.at(-1)?.id).toBe("account");
			for (const link of links) {
				const url = new URL(link.href);
				expect(url.protocol).toBe("https:");
				expect(url.searchParams.get("utm_source")).toBe(current);
				expect(url.searchParams.get("utm_medium")).toBe("app_switcher");
			}
		},
	);

	it("leads with the apps people come back to", () => {
		expect(ids([...APP_SWITCHER_CATALOG]).slice(0, 3)).toEqual([
			"tuvi",
			"miu",
			"webnhanh",
		]);
	});

	it("labels the links in the requested locale", () => {
		const options = {
			current: "chat",
			domain: "hoandat.com",
		} as const;
		const account = (locale: "en" | "vi" | "zh-CN") =>
			appSwitcherLinks({ ...options, locale }).at(-1)?.label;
		expect(account("en")).toBe("Manage your account");
		expect(account("vi")).toBe("Quản lý tài khoản");
		expect(account("zh-CN")).toBe("管理你的账号");
		const vi = appSwitcherLinks({ ...options, locale: "vi" });
		expect(vi[0]).toMatchObject({
			id: "tuvi",
			label: "Tử Vi",
			description: "Lập lá số 12 cung và xin quẻ mỗi ngày, xem cho vui.",
		});
	});

	it.each([
		["vi", "vi"],
		["vi-VN", "vi"],
		["VI-vn", "vi"],
		["zh", "zh-CN"],
		["zh-CN", "zh-CN"],
		["zh-cn", "zh-CN"],
		["zh-Hans-CN", "zh-CN"],
		["en", "en"],
		["EN-us", "en"],
	])("resolves the BCP 47 tag %j to the %j labels", (tag, locale) => {
		expect(resolveAppSwitcherLocale(tag)).toBe(locale);
	});

	it.each(["fr", "fr-FR", "vie", "zhx", ""])(
		"falls back to English for %j, a locale it has no labels for",
		(tag) => {
			expect(resolveAppSwitcherLocale(tag)).toBe("en");
		},
	);

	it("labels the links of a regional tag such as vi-VN", () => {
		const [first] = appSwitcherLinks({
			current: "chat",
			domain: "hoandat.com",
			locale: "vi-VN",
		});
		expect(first?.description).toBe(
			"Lập lá số 12 cung và xin quẻ mỗi ngày, xem cho vui.",
		);
	});

	it.each([
		"HOANDAT.com",
		"hoandat.com:8443",
		"hoandat.com/x",
		"localhost",
		"",
	])("rejects %j as a root domain", (domain) => {
		expect(() =>
			appSwitcherLinks({
				current: "chat",
				domain,
				locale: "en",
			}),
		).toThrow("is not a root domain");
	});

	it("rejects an app that is not in the catalog", () => {
		expect(() =>
			appSwitcherLinks({
				current: "miu" as AppSwitcherAppId,
				domain: "hoandat.com",
				locale: "en",
			}),
		).toThrow('"miu" is not a catalog app');
	});
});
