import { describe, expect, it } from "vitest";
import { defineBrand } from "../src/index.js";
import chatConfig from "./fixtures/chat/brand.config.json" with {
	type: "json",
};
import miuConfig from "./fixtures/miu/brand.config.json" with { type: "json" };

describe("defineBrand", () => {
	it("returns the imported config with its own precise type", () => {
		const chat = defineBrand(chatConfig);
		expect(chat).toBe(chatConfig);
		// Compile-time: chat's JSON has these, so they are not optional here.
		const miniApp: string = chat.sharedDomains.miniApp;
		const primary: string = chat.colors.primary;
		expect([miniApp, primary]).toEqual(["chat-apps.invalid", "#6e56cf"]);

		const miu = defineBrand(miuConfig);
		const theme: string = miu.colors.theme;
		expect(theme).toBe("#8fd0ff");
	});

	it("rejects a config missing a required string or the {domain} slot", () => {
		const { appName: _appName, ...nameless } = chatConfig;
		// @ts-expect-error appName is required by the type as well.
		expect(() => defineBrand(nameless)).toThrow(/missing or empty appName/);
		expect(() => defineBrand({ ...chatConfig, shortName: "" })).toThrow(
			/shortName/,
		);
		expect(() =>
			defineBrand({ ...chatConfig, hostTemplates: { web: "chat.example" } }),
		).toThrow(/\{domain\}/);
	});
});
