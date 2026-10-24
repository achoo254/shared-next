// HTML of the 1080×1920 slides every Short is made of. Images are inlined as data URIs so a slide
// renders from `setContent` alone; fonts come from Google Fonts.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { AppShort, Slide } from "./apps.ts";

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
.hook{text-wrap:balance;font-size:96px;line-height:1.12;font-weight:800;letter-spacing:-2px}
.points{position:absolute;top:620px;left:90px;right:90px;display:flex;flex-direction:column;gap:44px}
.points div{display:flex;gap:30px;align-items:flex-start;font-size:50px;line-height:1.3;font-weight:600;
 background:#fff;border-radius:36px;padding:40px 44px;box-shadow:0 20px 60px rgba(60,40,140,.14)}
.points span{min-width:0;overflow-wrap:anywhere}
.points b{flex:none;width:60px;height:60px;border-radius:50%;background:#6e56cf;color:#fff;font-size:36px;
 display:flex;align-items:center;justify-content:center}
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

function brand(app: AppShort): string {
	return `<div class="brand"><img src="${dataUri(app.icon)}">${escapeHtml(app.name)}</div>`;
}

/** The app's icon, name and tagline: how an overview Short opens. */
export function introSlide(app: AppShort): string {
	return page(
		`<div class="center"><img class="logo" src="${dataUri(app.icon)}"><h2>${escapeHtml(app.name)}</h2><p>${escapeHtml(app.tagline)}</p></div>`,
	);
}

/** One line in large type under the app's badge: how a feature Short opens. */
export function hookSlide(app: AppShort, hook: string): string {
	return page(
		`${brand(app)}<div class="center"><div class="hook">${escapeHtml(hook)}</div></div>`,
	);
}

/** A title and a screenshot or terminal session. */
export function contentSlide(app: AppShort, slide: Slide): string {
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
		`${brand(app)}<div class="head"><h1>${escapeHtml(slide.title)}</h1><div class="sub">${escapeHtml(slide.sub)}</div></div>${visual}`,
	);
}

/** A title over a numbered list of short claims. */
export function pointsSlide(
	app: AppShort,
	title: string,
	points: string[],
): string {
	const list = points
		.map(
			(point, index) =>
				`<div><b>${index + 1}</b><span>${escapeHtml(point)}</span></div>`,
		)
		.join("");
	return page(
		`${brand(app)}<div class="head"><h1>${escapeHtml(title)}</h1></div><div class="points">${list}</div>`,
	);
}

/** The link to the app and how to sign in. */
export function outroSlide(app: AppShort): string {
	return page(
		`<div class="center"><img class="logo" src="${dataUri(app.icon)}"><h2 style="font-size:110px">Dùng thử ngay</h2>
    <div class="pill">${escapeHtml(app.host)}</div><div class="note">${escapeHtml(app.outroNote)}</div>
    <div class="small">Đăng nhập bằng Google hoặc GitHub · Hoandat Apps</div></div>`,
	);
}
