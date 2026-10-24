import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apps } from "../src/apps.ts";
import { features } from "../src/features.ts";
import { inWorkspace } from "../src/paths.ts";
import { featureLink, featureShort, shorts } from "../src/shorts.ts";
import { nextFeature } from "../src/weekly.ts";
import type { PostedShort } from "../src/youtube-upload.ts";

describe("weekly feature Shorts", () => {
	it("gives every Short its own id", () => {
		const ids = shorts.map((short) => short.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("lets the apps take turns", () => {
		expect(features.slice(0, apps.length).map((f) => f.app.id)).toEqual(
			apps.map((app) => app.id),
		);
		expect(features).toHaveLength(apps.length * 5);
	});

	it("keeps every title and description postable", () => {
		for (const feature of features) {
			const short = featureShort(feature);
			expect(short.title.length, short.id).toBeLessThanOrEqual(100);
			expect(short.description.length).toBeLessThanOrEqual(5000);
			// YouTube rejects angle brackets in titles and descriptions.
			expect(`${short.title}${short.description}`, short.id).not.toMatch(
				/[<>]/,
			);
			expect(short.description).toContain(featureLink(feature));
		}
	});

	it("tags the link with its own campaign and the feature", () => {
		const [first] = features;
		if (!first) throw new Error("no features");
		const url = new URL(featureLink(first));
		expect(url.host).toBe(first.app.host);
		expect(url.searchParams.get("utm_campaign")).toBe("feature-short");
		expect(url.searchParams.get("utm_content")).toBe(first.id);
	});

	it("picks the first feature the ledger does not have", () => {
		const posted = (id: string): PostedShort => ({
			short: id,
			app: "x",
			videoId: id,
			url: "",
			privacy: "private",
			postedAt: "",
		});
		const [first, second] = features;
		expect(nextFeature([posted("chat")])).toBe(first);
		expect(nextFeature([posted(first?.id ?? "")])).toBe(second);
		expect(nextFeature(features.map((f) => posted(f.id)))).toBeUndefined();
	});

	// CI checks out shared-next alone; the sibling repositories exist only on the dev machines.
	it.skipIf(!existsSync(inWorkspace("chat-next")))(
		"shows screenshots that exist",
		() => {
			for (const { visual } of features) {
				if ("shot" in visual)
					expect(existsSync(visual.shot), visual.shot).toBe(true);
			}
		},
	);
});
