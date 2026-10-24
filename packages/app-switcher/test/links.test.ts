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
	it("lists every other app, then the account page, on the primary tenant", () => {
		const links = appSwitcherLinks({
			current: "localman",
			tenantDomain: "hoandat.com",
			isPrimaryTenant: true,
			locale: "en",
		});
		expect(ids(links)).toEqual(["chat", "scribe", "tunelo", "account"]);
		expect(links.map((link) => link.href)).toEqual([
			"https://chat.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://scribe.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://tunnel.hoandat.com/?utm_source=localman&utm_medium=app_switcher",
			"https://auth.hoandat.com/account?utm_source=localman&utm_medium=app_switcher",
		]);
	});

	it("leaves out Chat and Scribe on another tenant", () => {
		const links = appSwitcherLinks({
			current: "localman",
			tenantDomain: "inetdev.io.vn",
			isPrimaryTenant: false,
			locale: "vi",
		});
		expect(ids(links)).toEqual(["tunelo", "account"]);
		expect(links[0]?.href).toBe(
			"https://tunnel.inetdev.io.vn/?utm_source=localman&utm_medium=app_switcher",
		);
	});

	it.each(APP_SWITCHER_APP_IDS)(
		"never lists the current app (%s)",
		(current) => {
			const links = appSwitcherLinks({
				current,
				tenantDomain: "hoandat.com",
				isPrimaryTenant: true,
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

	it("never lists Miu World", () => {
		expect(ids([...APP_SWITCHER_CATALOG])).not.toContain("miu");
	});

	it("labels the links in the requested locale", () => {
		const options = {
			current: "chat",
			tenantDomain: "hoandat.com",
			isPrimaryTenant: true,
		} as const;
		const account = (locale: "en" | "vi" | "zh-CN") =>
			appSwitcherLinks({ ...options, locale }).at(-1)?.label;
		expect(account("en")).toBe("Manage your account");
		expect(account("vi")).toBe("Quản lý tài khoản");
		expect(account("zh-CN")).toBe("管理你的账号");
		const vi = appSwitcherLinks({ ...options, locale: "vi" });
		expect(vi[0]).toMatchObject({
			id: "scribe",
			label: "Scribe",
			description:
				"Ghi âm và chuyển thành bản chép lời để tìm kiếm, chỉnh sửa.",
		});
	});

	it("falls back to English for a locale it has no labels for", () => {
		expect(resolveAppSwitcherLocale("fr")).toBe("en");
		expect(resolveAppSwitcherLocale("zh-CN")).toBe("zh-CN");
	});

	it.each([
		"HOANDAT.com",
		"hoandat.com:8443",
		"hoandat.com/x",
		"localhost",
		"",
	])("rejects %j as a tenant domain", (tenantDomain) => {
		expect(() =>
			appSwitcherLinks({
				current: "chat",
				tenantDomain,
				isPrimaryTenant: true,
				locale: "en",
			}),
		).toThrow("is not a tenant domain");
	});

	it("rejects an app that is not in the catalog", () => {
		expect(() =>
			appSwitcherLinks({
				current: "miu" as AppSwitcherAppId,
				tenantDomain: "hoandat.com",
				isPrimaryTenant: true,
				locale: "en",
			}),
		).toThrow('"miu" is not a catalog app');
	});
});
