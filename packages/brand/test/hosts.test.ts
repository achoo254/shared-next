import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_SCHEMA_URL, loadBrandConfig } from "../src/build.js";
import {
	DOMAIN_PATTERN,
	allowedOrigins,
	hostsFor,
	miniAppOrigin,
	primaryOrigin,
} from "../src/hosts.js";
import { consumer } from "./consumers.js";

const chat = loadBrandConfig(consumer("chat").root);
const miu = loadBrandConfig(consumer("miu").root);

describe("hosts", () => {
	it("derives each tenant's web host from the template", () => {
		expect(hostsFor(chat, "inetdev.io.vn")).toEqual({
			web: "chat.inetdev.io.vn",
			webOrigin: "https://chat.inetdev.io.vn",
		});
		expect(hostsFor(miu, "inetdev.io.vn").web).toBe("miu.inetdev.io.vn");
	});

	it("gives the primary tenant's origin", () => {
		expect(primaryOrigin(miu)).toBe("https://miu.hoandat.com");
		expect(primaryOrigin(chat)).toBe("https://chat.hoandat.com");
	});

	it("puts Mini Apps on the shared domain, never a tenant's", () => {
		expect(miniAppOrigin(chat, 42)).toBe("https://b42.chat-apps.invalid");
		expect(() => miniAppOrigin(miu, 42)).toThrow(/sharedDomains/);
		expect(() => miniAppOrigin(chat, -1)).toThrow(/bot id/);
		expect(() => miniAppOrigin(chat, 1.5)).toThrow(/bot id/);
	});

	it("accepts development origins only in development", () => {
		expect(allowedOrigins(chat, "hoandat.com", false)).toEqual([
			"https://chat.hoandat.com",
		]);
		expect(allowedOrigins(chat, "hoandat.com", true)).toEqual([
			"https://chat.hoandat.com",
			"http://localhost:5173",
		]);
		expect(allowedOrigins(miu, "hoandat.com", true)).toEqual([
			"https://miu.hoandat.com",
		]);
	});

	it("rejects a domain the schema would not accept", () => {
		for (const domain of [
			"",
			"acme",
			"Acme.vn",
			"acme.vn:8443",
			"acme.vn/x",
			"-acme.vn",
			"$&.vn",
		]) {
			expect(() => hostsFor(chat, domain), domain).toThrow(
				/is not a root domain/,
			);
		}
		expect(() => allowedOrigins(chat, "evil.vn/x", false)).toThrow();
	});

	it("checks domains with the schema's own domain pattern", () => {
		let node: unknown = JSON.parse(readFileSync(BRAND_SCHEMA_URL, "utf8"));
		for (const key of ["$defs", "domain", "pattern"]) {
			node =
				typeof node === "object" && node !== null
					? Reflect.get(node, key)
					: undefined;
		}
		expect(node).toBe(DOMAIN_PATTERN.source);
	});
});
