import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	BRAND_SCHEMA_URL,
	loadBrandConfig,
	parseBrandConfig,
} from "../src/build.js";
import { CONSUMERS, consumer, rawConfig } from "./consumers.js";

const chat = loadBrandConfig(consumer("chat").root, {
	require: consumer("chat").require,
});

describe("brand.config.schema.json", () => {
	it("ships next to the sources, where the package exports it", () => {
		expect(existsSync(BRAND_SCHEMA_URL)).toBe(true);
	});

	it.each(CONSUMERS)("accepts $name's config with its required fields", (c) => {
		const brand = loadBrandConfig(c.root, { require: c.require });
		expect(brand).toEqual(rawConfig(c.name));
		expect(brand.urlScheme).toBe(brand.appIds.ios);
	});

	it("takes the root as a path as well as a URL", () => {
		const root = fileURLToPath(consumer("miu").root);
		expect(loadBrandConfig(root)).toEqual(rawConfig("miu"));
		expect(loadBrandConfig(root.replace(/\/$/, ""))).toEqual(rawConfig("miu"));
	});

	it("keeps webInstall optional, so only products that switch it need it", () => {
		const localman = loadBrandConfig(consumer("localman").root, {
			require: ["webInstall"],
		});
		const webInstall: boolean = localman.webInstall;
		expect(webInstall).toBe(false);
		const { webInstall: _webInstall, ...without } = localman;
		expect(parseBrandConfig(without).webInstall).toBeUndefined();
		expect(() =>
			parseBrandConfig(without, { require: ["webInstall"] }),
		).toThrow("/webInstall is required here");
		expect(() => parseBrandConfig({ ...localman, webInstall: "no" })).toThrow(
			/webInstall must be boolean/,
		);
	});

	it("rejects an invalid bundle id, colour and unknown field, listing each", () => {
		expect(() =>
			parseBrandConfig({
				...chat,
				appIds: { ...chat.appIds, ios: "Not A Bundle" },
				colors: { ...chat.colors, primary: "blue" },
				extra: true,
			}),
		).toThrow(/appIds\/ios.*colors\/primary|colors\/primary.*appIds\/ios/s);
	});

	it("rejects a missing field and an icon outside the brand root", () => {
		const { appName: _appName, ...nameless } = chat;
		expect(() => parseBrandConfig(nameless)).toThrow(/appName/);
		for (const icon of ["../secret.png", "brand/../../x.svg", "icon.gif"]) {
			expect(() => parseBrandConfig({ ...chat, icon }), icon).toThrow(
				/\/icon /,
			);
		}
	});

	it("rejects an issuer that is not an https origin of a domain", () => {
		for (const issuer of [
			"https://..",
			"https://-",
			"https://auth.example.com/",
			"https://Auth.example.com",
			"http://auth.example.com",
		]) {
			expect(
				() =>
					parseBrandConfig({
						...chat,
						primaryTenant: { ...chat.primaryTenant, issuer },
					}),
				issuer,
			).toThrow(/primaryTenant\/issuer/);
		}
	});

	it("rejects a host template without {domain} and a non-local dev origin", () => {
		expect(() =>
			parseBrandConfig({ ...chat, hostTemplates: { web: "chat.example.com" } }),
		).toThrow(/hostTemplates\/web/);
		expect(() =>
			parseBrandConfig({ ...chat, devOrigins: ["https://evil.example"] }),
		).toThrow(/devOrigins\/0/);
	});
});

describe("require", () => {
	it("fails on the optional fields a product needs, naming each", () => {
		const scribe = rawConfig("scribe");
		expect(() =>
			parseBrandConfig(scribe, {
				require: ["pushSenderName", "appIds.android", "colors.theme"],
			}),
		).toThrow(
			"brand.config.json is invalid: /pushSenderName is required here; /appIds/android is required here; /colors/theme is required here",
		);
	});

	it("has no desktop app id: desktop is the installable web app", () => {
		expect(() =>
			parseBrandConfig({
				...chat,
				appIds: { ...chat.appIds, desktop: "com.hoandat.chat" },
			}),
		).toThrow(/appIds must NOT have additional properties/);
	});

	it("types the required fields as present", () => {
		// Compile-time: these are string, not string | undefined.
		const media: string = chat.sharedDomains.media;
		const primary: string = chat.colors.primary;
		const android: string = chat.appIds.android;
		const sender: string = chat.pushSenderName;
		expect([media, primary, android, sender]).toEqual([
			"media.chat-media.invalid",
			"#6e56cf",
			"com.hoandat.chat",
			"Chat",
		]);
	});

	it("never places Mini Apps or media under the tenant's domain (chat)", () => {
		const tenant = chat.primaryTenant.domain;
		expect(chat.sharedDomains.miniApp.endsWith(tenant)).toBe(false);
		expect(chat.sharedDomains.media.endsWith(tenant)).toBe(false);
	});
});
