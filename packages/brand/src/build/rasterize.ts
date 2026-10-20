/**
 * Drawing SVGs into PNGs is injected: a product passes the Chromium it
 * already installs for its e2e tests (`playwright` or `@playwright/test`),
 * so this package depends on neither and needs no image library.
 */

export interface RenderRequest {
	/** Brand-root-relative path of the SVG, for error messages. */
	readonly path: string;
	/** The SVG file's bytes. */
	readonly svg: Uint8Array;
	/** Width and height of the PNG, in pixels. */
	readonly size: number;
}

/** Returns one PNG per request, in order, with a transparent background. */
export type IconRenderer = (
	requests: readonly RenderRequest[],
) => Promise<readonly Uint8Array[]>;

/** The part of Playwright's Page the renderer uses. */
export interface ChromiumPage {
	setViewportSize(size: { width: number; height: number }): Promise<void>;
	setContent(html: string): Promise<void>;
	locator(selector: string): { waitFor(): Promise<void> };
	waitForFunction(expression: string): Promise<unknown>;
	evaluate(expression: string): Promise<unknown>;
	screenshot(options: {
		omitBackground: boolean;
		clip: { x: number; y: number; width: number; height: number };
	}): Promise<Uint8Array>;
}

/** The part of Playwright's `chromium` (a BrowserType) the renderer uses. */
export interface ChromiumLauncher {
	launch(): Promise<{
		newPage(options: { deviceScaleFactor: number }): Promise<ChromiumPage>;
		close(): Promise<void>;
	}>;
}

function pageHtml(svg: Uint8Array, size: number): string {
	const data = Buffer.from(svg).toString("base64");
	return `<html><body style="margin:0;background:transparent"><img id="i" width="${size}" height="${size}" style="display:block" src="data:image/svg+xml;base64,${data}"></body></html>`;
}

/**
 * A renderer drawing each SVG as an <img> in one Chromium page:
 *
 *   import { chromium } from "playwright"; // or "@playwright/test"
 *   const renderer = chromiumRenderer(chromium);
 */
export function chromiumRenderer(chromium: ChromiumLauncher): IconRenderer {
	return async (requests) => {
		const browser = await chromium.launch();
		try {
			const page = await browser.newPage({ deviceScaleFactor: 1 });
			const pngs: Uint8Array[] = [];
			for (const { path, svg, size } of requests) {
				await page.setViewportSize({ width: size, height: size });
				await page.setContent(pageHtml(svg, size));
				await page.locator("#i").waitFor();
				await page.waitForFunction("document.getElementById('i').complete");
				// A broken SVG still "completes", with no image: never ship it as a blank PNG.
				const width = await page.evaluate(
					"document.getElementById('i').naturalWidth",
				);
				if (typeof width !== "number" || width === 0) {
					throw new Error(`brand: ${path} did not render (invalid SVG?)`);
				}
				pngs.push(
					await page.screenshot({
						omitBackground: true,
						clip: { x: 0, y: 0, width: size, height: size },
					}),
				);
			}
			return pngs;
		} finally {
			await browser.close();
		}
	};
}
