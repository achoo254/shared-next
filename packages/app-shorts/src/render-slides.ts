// Renders the slides of a Short to `out/<id>/sNN.png` with the Chromium of Miu World's Playwright.
//
//   node src/render-slides.ts [short id …]   (no id: the four overview Shorts)
import { mkdirSync } from "node:fs";
import path from "node:path";
import { apps } from "./apps.ts";
import { isEntryPoint, loadChromium, outDir } from "./paths.ts";
import { type Short, findShort } from "./shorts.ts";

export async function renderSlides(selected: Short[]): Promise<void> {
	const browser = await loadChromium().launch();
	try {
		const context = await browser.newContext({
			viewport: { width: 1080, height: 1920 },
			deviceScaleFactor: 1,
		});
		const tab = await context.newPage();
		for (const short of selected) {
			const dir = path.join(outDir, short.id);
			mkdirSync(dir, { recursive: true });
			const slides = short.slides();
			for (const [index, html] of slides.entries()) {
				await tab.setContent(html, { waitUntil: "networkidle" });
				await tab.evaluate(() => document.fonts.ready);
				await tab.screenshot({
					path: path.join(dir, `s${String(index).padStart(2, "0")}.png`),
				});
			}
			console.log(`${short.id}: ${slides.length} slides`);
		}
	} finally {
		await browser.close();
	}
}

if (isEntryPoint(import.meta.url)) {
	const ids = process.argv.slice(2);
	await renderSlides(
		(ids.length > 0 ? ids : apps.map((app) => app.id)).map(findShort),
	);
}
