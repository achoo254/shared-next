import { describe, expect, it } from "vitest";
import {
	type ChromiumLauncher,
	type ChromiumPage,
	chromiumRenderer,
} from "../src/build.js";

/** A stand-in for Playwright's chromium that records what the renderer does. */
function fakeChromium(failOnSize?: number, naturalWidth = 64) {
	const calls: string[] = [];
	const page: ChromiumPage = {
		async setViewportSize({ width, height }) {
			calls.push(`viewport ${width}x${height}`);
		},
		async setContent(html) {
			calls.push(`content ${html}`);
		},
		locator(selector) {
			return {
				async waitFor() {
					calls.push(`wait ${selector}`);
				},
			};
		},
		async waitForFunction(expression) {
			calls.push(`function ${expression}`);
		},
		async evaluate(expression) {
			calls.push(`evaluate ${expression}`);
			return naturalWidth;
		},
		async screenshot({ omitBackground, clip }) {
			if (clip.width === failOnSize) throw new Error("screenshot failed");
			calls.push(`shot ${clip.width} ${omitBackground}`);
			return new Uint8Array([clip.width]);
		},
	};
	const chromium: ChromiumLauncher = {
		async launch() {
			calls.push("launch");
			return {
				async newPage({ deviceScaleFactor }) {
					calls.push(`page ${deviceScaleFactor}`);
					return page;
				},
				async close() {
					calls.push("close");
				},
			};
		},
	};
	return { chromium, calls };
}

const svg = new TextEncoder().encode("<svg/>");

describe("chromiumRenderer", () => {
	it("draws each SVG at its size in one browser, transparent, in order", async () => {
		const { chromium, calls } = fakeChromium();
		const pngs = await chromiumRenderer(chromium)([
			{ path: "a.svg", svg, size: 16 },
			{ path: "a.svg", svg, size: 32 },
		]);
		expect(pngs.map((png) => png[0])).toEqual([16, 32]);
		expect(calls.filter((call) => call === "launch")).toHaveLength(1);
		expect(calls).toContain("page 1");
		expect(calls).toContain("viewport 32x32");
		expect(calls).toContain("shot 16 true");
		const content = calls.find((call) => call.startsWith("content "));
		expect(content).toContain(
			`src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"`,
		);
		expect(content).toContain('width="16" height="16"');
		expect(calls.at(-1)).toBe("close");
	});

	it("refuses an SVG the browser cannot draw, naming it", async () => {
		const { chromium, calls } = fakeChromium(undefined, 0);
		await expect(
			chromiumRenderer(chromium)([{ path: "brand/broken.svg", svg, size: 16 }]),
		).rejects.toThrow("brand: brand/broken.svg did not render (invalid SVG?)");
		expect(calls).toContain(
			"evaluate document.getElementById('i').naturalWidth",
		);
		expect(calls).not.toContain("shot 16 true");
		expect(calls.at(-1)).toBe("close");
	});

	it("closes the browser when drawing fails", async () => {
		const { chromium, calls } = fakeChromium(32);
		await expect(
			chromiumRenderer(chromium)([
				{ path: "a.svg", svg, size: 16 },
				{ path: "a.svg", svg, size: 32 },
			]),
		).rejects.toThrow("screenshot failed");
		expect(calls.at(-1)).toBe("close");
	});
});
