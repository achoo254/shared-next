/**
 * Drawing SVGs into PNGs is injected: a product passes the Chromium it
 * already installs for its e2e tests (`playwright` or `@playwright/test`),
 * so this package depends on neither and needs no image library.
 */
function pageHtml(svg, size) {
    const data = Buffer.from(svg).toString("base64");
    return `<html><body style="margin:0;background:transparent"><img id="i" width="${size}" height="${size}" style="display:block" src="data:image/svg+xml;base64,${data}"></body></html>`;
}
/**
 * A renderer drawing each SVG as an <img> in one Chromium page:
 *
 *   import { chromium } from "playwright"; // or "@playwright/test"
 *   const renderer = chromiumRenderer(chromium);
 */
export function chromiumRenderer(chromium) {
    return async (requests) => {
        const browser = await chromium.launch();
        try {
            const page = await browser.newPage({ deviceScaleFactor: 1 });
            const pngs = [];
            for (const { path, svg, size } of requests) {
                await page.setViewportSize({ width: size, height: size });
                await page.setContent(pageHtml(svg, size));
                await page.locator("#i").waitFor();
                await page.waitForFunction("document.getElementById('i').complete");
                // A broken SVG still "completes", with no image: never ship it as a blank PNG.
                const width = await page.evaluate("document.getElementById('i').naturalWidth");
                if (typeof width !== "number" || width === 0) {
                    throw new Error(`brand: ${path} did not render (invalid SVG?)`);
                }
                pngs.push(await page.screenshot({
                    omitBackground: true,
                    clip: { x: 0, y: 0, width: size, height: size },
                }));
            }
            return pngs;
        }
        finally {
            await browser.close();
        }
    };
}
