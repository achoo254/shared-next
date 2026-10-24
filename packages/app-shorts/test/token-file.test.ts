import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	CredentialError,
	readYoutubeSecret,
	saveYoutubeSecret,
	tokenFilePath,
} from "../src/token-file.ts";

function tokenFile(content: unknown, newline = "\n"): string {
	const file = path.join(
		mkdtempSync(path.join(tmpdir(), "app-shorts-")),
		"access-tokens.json",
	);
	writeFileSync(file, JSON.stringify(content, null, 2).replace(/\n/g, newline));
	return file;
}

const grant = {
	client_id: "id",
	client_secret: "placeholder",
	refresh_token: "placeholder",
};

describe("token file", () => {
	it("adds a grant and keeps every other key and entry, including odd shapes", () => {
		const other = { service: "example.com", used_by: [], token: "x" };
		const file = tokenFile({ _meta: { note: "kept" }, tokens: [other] });
		saveYoutubeSecret(file, "hoandat-apps marketing", grant);
		const saved = JSON.parse(readFileSync(file, "utf8"));
		expect(saved._meta).toEqual({ note: "kept" });
		expect(saved.tokens[0]).toEqual(other);
		expect(readYoutubeSecret(file, "hoandat-apps marketing")).toEqual(grant);
	});

	it("replaces the grant of the same user instead of adding a second", () => {
		const file = tokenFile({ tokens: [] });
		saveYoutubeSecret(file, "miu-world marketing", grant);
		saveYoutubeSecret(file, "miu-world marketing", {
			...grant,
			client_id: "new",
		});
		expect(JSON.parse(readFileSync(file, "utf8")).tokens).toHaveLength(1);
		expect(readYoutubeSecret(file, "miu-world marketing").client_id).toBe(
			"new",
		);
	});

	it("keeps Windows line endings when the file has them", () => {
		const file = tokenFile({ tokens: [] }, "\r\n");
		saveYoutubeSecret(file, "miu-world marketing", grant);
		expect(readFileSync(file, "utf8")).toContain("\r\n");
	});

	it("names the missing field without quoting any value", () => {
		const file = tokenFile({
			tokens: [
				{
					service: "youtube.googleapis.com",
					used_by: "u",
					token: { client_id: "id", client_secret: "s3cr3t-value" },
				},
			],
		});
		expect(() => readYoutubeSecret(file, "u")).toThrow(/refresh_token/);
		expect(() => readYoutubeSecret(file, "u")).not.toThrow(/s3cr3t-value/);
	});

	it("asks for the file path when neither the argument nor the variable is set", () => {
		expect(() => tokenFilePath(undefined, {})).toThrow(CredentialError);
		expect(tokenFilePath(undefined, { MARKETING_TOKEN_FILE: "/f" })).toBe("/f");
	});
});
