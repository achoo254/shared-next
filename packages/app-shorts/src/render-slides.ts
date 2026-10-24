// Renders the 1080×1920 slides of each Short to `out/<app>/sNN.png`: the app's icon and tagline, five
// slides of a screenshot or terminal under a title, and a last slide with the link.
//
//   node src/render-slides.ts [app]
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { type AppShort, apps } from "./apps.ts";
import { isEntryPoint, loadChromium, outDir } from "./paths.ts";

const MIME: Record<string, string> = {
	".png": "image/png",
	".svg": "image/svg+xml",
	".jpg": "image/jpeg",
};

function dataUri(file: string): string {
	const mime = MIME[path.extname(file)];
	if (!mime) throw new Error(`no image type for ${file}`);
	return `data:${mime};base64,${readFileSync(file).toString("base64")}`;
}

const escapeHtml = (text: string): string =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Brand primary #6e56cf is the colour all four apps share.
const css = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#1c1640;
 background:radial-gradient(900px 700px at 85% 8%,#d9d1ff 0,transparent 70%),radial-gradient(800px 800px at 0% 100%,#e6e0ff 0,transparent 70%),#f6f4ff}
.brand{position:absolute;top:120px;left:90px;display:flex;align-items:center;gap:18px;font-weight:700;font-size:34px;color:#6e56cf}
.brand img{width:64px;height:64px;border-radius:16px}
.head{position:absolute;top:230px;left:90px;right:90px}
h1{text-wrap:balance;font-size:76px;line-height:1.12;font-weight:800;letter-spacing:-1px}
.sub{text-wrap:balance;margin-top:22px;font-size:40px;line-height:1.3;color:#5b5480;font-weight:500}
.shot{position:absolute;left:150px;right:150px;top:600px;height:1080px;border-radius:44px;overflow:hidden;background:#fff;
 box-shadow:0 40px 90px rgba(60,40,140,.28),0 0 0 10px #fff}
.shot img{width:100%;height:100%;object-fit:cover;object-position:top}
.term{position:absolute;left:90px;right:90px;top:720px;border-radius:36px;background:#17142b;padding:40px 46px 56px;
 box-shadow:0 40px 90px rgba(30,20,80,.35);font-family:'JetBrains Mono',monospace;font-size:40px;line-height:1.7;color:#e9e6ff;white-space:pre;font-variant-ligatures:none}
.dots{display:flex;gap:14px;margin-bottom:34px}.dots i{width:22px;height:22px;border-radius:50%;background:#ff5f57}
.dots i:nth-child(2){background:#febc2e}.dots i:nth-child(3){background:#28c840}
.term .p{color:#a996ff}.term .o{color:#b9b4d6}.term .u{color:#7ee2b8}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 110px 260px}
.center .logo{width:300px;height:300px;border-radius:72px;box-shadow:0 30px 80px rgba(80,50,180,.3);background:#fff}
.center h2{margin-top:60px;font-size:140px;font-weight:800;letter-spacing:-3px}
.center p{text-wrap:balance;margin-top:28px;font-size:50px;line-height:1.3;color:#4b4470;font-weight:500}
.pill{margin-top:60px;padding:26px 52px;border-radius:999px;background:#6e56cf;color:#fff;font-size:56px;font-weight:700}
.note{margin-top:34px;font-size:40px;color:#5b5480;font-weight:600}
.small{margin-top:22px;font-size:34px;color:#7a739c}
`;

const page = (body: string): string =>
	`<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

/** Colour of a terminal line: commands plain, URLs and `=>` results green, other output grey. */
function lineClass(prompt: string, text: string): string {
	if (prompt === "$ ") return "";
	return text.startsWith("http") || prompt === "=> " ? "u" : "o";
}

export function slidesFor(app: AppShort): string[] {
	const icon = dataUri(app.icon);
	const brand = `<div class="brand"><img src="${icon}">${escapeHtml(app.name)}</div>`;
	const intro = page(
		`<div class="center"><img class="logo" src="${icon}"><h2>${escapeHtml(app.name)}</h2><p>${escapeHtml(app.tagline)}</p></div>`,
	);
	const middle = app.slides.map((slide) => {
		const visual =
			"shot" in slide
				? `<div class="shot"><img src="${dataUri(slide.shot)}"></div>`
				: `<div class="term"><div class="dots"><i></i><i></i><i></i></div>${slide.term
						.map(
							([prompt, text]) =>
								`<div><span class="p">${escapeHtml(prompt)}</span><span class="${lineClass(prompt, text)}">${escapeHtml(text)}</span></div>`,
						)
						.join("")}</div>`;
		return page(
			`${brand}<div class="head"><h1>${escapeHtml(slide.title)}</h1><div class="sub">${escapeHtml(slide.sub)}</div></div>${visual}`,
		);
	});
	const outro = page(
		`<div class="center"><img class="logo" src="${icon}"><h2 style="font-size:110px">Dùng thử ngay</h2>
    <div class="pill">${escapeHtml(app.host)}</div><div class="note">${escapeHtml(app.outroNote)}</div>
    <div class="small">Đăng nhập bằng Google hoặc GitHub · Hoandat Apps</div></div>`,
	);
	return [intro, ...middle, outro];
}

export async function renderSlides(selected: AppShort[]): Promise<void> {
	const browser = await loadChromium().launch();
	try {
		const context = await browser.newContext({
			viewport: { width: 1080, height: 1920 },
			deviceScaleFactor: 1,
		});
		const tab = await context.newPage();
		for (const app of selected) {
			const dir = path.join(outDir, app.id);
			mkdirSync(dir, { recursive: true });
			const slides = slidesFor(app);
			for (const [index, html] of slides.entries()) {
				await tab.setContent(html, { waitUntil: "networkidle" });
				await tab.evaluate(() => document.fonts.ready);
				await tab.screenshot({
					path: path.join(dir, `s${String(index).padStart(2, "0")}.png`),
				});
			}
			console.log(`${app.id}: ${slides.length} slides`);
		}
	} finally {
		await browser.close();
	}
}

if (isEntryPoint(import.meta.url)) {
	const only = process.argv[2];
	await renderSlides(apps.filter((app) => !only || app.id === only));
}
