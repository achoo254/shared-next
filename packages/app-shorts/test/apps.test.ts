import { existsSync } from "node:fs";
import { expect, describe as group, it } from "vitest";
import { UTM, apps, describe } from "../src/apps.ts";
import { inWorkspace } from "../src/paths.ts";
import { readLedger, videoResource } from "../src/youtube-upload.ts";

group("app Shorts", () => {
	it("keeps titles and descriptions within YouTube's limits", () => {
		for (const app of apps) {
			expect(app.title.length).toBeLessThanOrEqual(100);
			expect(describe(app).length).toBeLessThanOrEqual(5000);
			// YouTube rejects angle brackets in titles and descriptions.
			expect(`${app.title}${describe(app)}`).not.toMatch(/[<>]/);
		}
	});

	it("links each app's own host with the campaign tags and the app directory", () => {
		for (const app of apps) {
			const text = describe(app);
			expect(text).toContain(`https://${app.host}/?${UTM}`);
			expect(text).toContain("https://auth.hoandat.com/apps");
			expect(
				text.endsWith(app.hashtags.map((tag) => `#${tag}`).join(" ")),
			).toBe(true);
		}
	});

	// CI checks out shared-next alone; the sibling repositories exist only on the dev machines.
	it.skipIf(!existsSync(inWorkspace("chat-next")))(
		"has five slides per app and points at files that exist",
		() => {
			for (const app of apps) {
				expect(app.slides).toHaveLength(5);
				const files = [
					app.icon,
					...app.slides.flatMap((s) => ("shot" in s ? [s.shot] : [])),
				];
				for (const file of files) expect(existsSync(file), file).toBe(true);
			}
		},
	);

	it("declares the upload as not made for kids, in Vietnamese, under Science & Technology", () => {
		const [first] = apps;
		if (!first) throw new Error("no apps");
		const resource = videoResource(first, "private") as {
			snippet: { categoryId: string; defaultLanguage: string };
			status: { privacyStatus: string; selfDeclaredMadeForKids: boolean };
		};
		expect(resource.snippet.categoryId).toBe("28");
		expect(resource.snippet.defaultLanguage).toBe("vi");
		expect(resource.status).toEqual({
			privacyStatus: "private",
			selfDeclaredMadeForKids: false,
		});
	});

	it("records each posted Short once, for a known app", () => {
		const ledger = readLedger();
		const ids = new Set(apps.map((app) => app.id));
		for (const entry of ledger) {
			expect(ids.has(entry.app)).toBe(true);
			expect(entry.url).toBe(`https://youtube.com/shorts/${entry.videoId}`);
		}
		expect(new Set(ledger.map((entry) => entry.videoId)).size).toBe(
			ledger.length,
		);
	});
});
