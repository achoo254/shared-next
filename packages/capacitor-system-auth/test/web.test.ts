import { describe, expect, it } from "vitest";
import type { AuthenticateOptions } from "../src/index.js";
import { SystemAuthWeb } from "../src/web.js";

const url = "https://auth.hoandat.com/auth";

describe("SystemAuthWeb", () => {
	const plugin = new SystemAuthWeb();

	it.each<AuthenticateOptions>([
		{ url, callback: { scheme: "com.hoandat.chat" } },
		{
			url,
			callback: {
				https: { host: "localman.hoandat.com", path: "/m/auth/callback" },
			},
			preferEphemeral: true,
		},
	])("rejects authenticate with UNSUPPORTED (%o)", async (options) => {
		const result = plugin.authenticate(options);
		await expect(result).rejects.toBeInstanceOf(Error);
		await expect(result).rejects.toMatchObject({
			code: "UNSUPPORTED",
			message: "SystemAuth is only available in the native app",
		});
	});

	it("reports https callbacks as unavailable", async () => {
		await expect(plugin.isAvailable()).resolves.toEqual({ https: false });
	});
});
