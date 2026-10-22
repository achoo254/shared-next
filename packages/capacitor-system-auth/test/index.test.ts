import { describe, expect, it } from "vitest";
import { SystemAuth } from "../src/index.js";

// No native bridge under Node, so Capacitor resolves to the web implementation.
describe("SystemAuth", () => {
	it("loads the web implementation outside the native app", async () => {
		await expect(
			SystemAuth.authenticate({
				url: "https://auth.hoandat.com/auth",
				callback: { scheme: "com.hoandat.chat" },
			}),
		).rejects.toMatchObject({ code: "UNSUPPORTED" });
		await expect(SystemAuth.isAvailable()).resolves.toEqual({ https: false });
	});
});
