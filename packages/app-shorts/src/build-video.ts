// Joins `out/<id>/sNN.png` into a 1080×1920, 30 fps Short with ffmpeg: a slow zoom on each slide,
// 0.5 s fades between them, and the app's track from Miu World's CC0 music pack. Writes `out/<id>.mp4`.
//
//   node src/build-video.ts [short id …]   (no id: the four overview Shorts)
import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { apps } from "./apps.ts";
import { isEntryPoint, musicDir, outDir } from "./paths.ts";
import { type Short, findShort } from "./shorts.ts";

const FPS = 30;
const FADE = 0.5;
const FIRST_SLIDE = 2.6;
const SLIDE = 3.6;
/** How far each slide zooms in over its time on screen. */
const ZOOM = 0.035;

export function slideDurations(count: number): number[] {
	return Array.from({ length: count }, (_, index) =>
		index === 0 ? FIRST_SLIDE : SLIDE,
	);
}

/** Length of the joined video: every slide, less the overlap of each fade. */
export function totalSeconds(durations: number[]): number {
	const sum = durations.reduce((total, seconds) => total + seconds, 0);
	return Math.round((sum - FADE * (durations.length - 1)) * 1000) / 1000;
}

/** The ffmpeg filter graph for `durations.length` image inputs followed by one audio input. */
export function filterGraph(durations: number[]): {
	graph: string;
	video: string;
	total: number;
} {
	const parts: string[] = [];
	let previous = "v0";
	let elapsed = 0;
	for (const [index, seconds] of durations.entries()) {
		const frames = Math.floor(seconds * FPS);
		// Scaling up first keeps zoompan from stepping a whole pixel per frame.
		parts.push(
			`[${index}]scale=2160:3840,zoompan=z='1+${ZOOM}*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${FPS},setsar=1,format=yuv420p[v${index}]`,
		);
		if (index === 0) {
			elapsed = seconds;
			continue;
		}
		const offset = Math.round((elapsed - FADE) * 1000) / 1000;
		parts.push(
			`[${previous}][v${index}]xfade=transition=fade:duration=${FADE}:offset=${offset}[x${index}]`,
		);
		previous = `x${index}`;
		elapsed = elapsed + seconds - FADE;
	}
	const total = totalSeconds(durations);
	parts.push(
		`[${durations.length}:a]atrim=0:${total},afade=t=in:d=0.4,afade=t=out:st=${total - 1.5}:d=1.5,volume=0.8[a]`,
	);
	return { graph: parts.join(";"), video: previous, total };
}

export function buildVideo(short: Short): string {
	const dir = path.join(outDir, short.id);
	const slides = readdirSync(dir)
		.filter((name) => /^s\d+\.png$/.test(name))
		.sort();
	if (slides.length === 0) {
		throw new Error(`no slides in ${dir}; run render-slides first`);
	}
	const durations = slideDurations(slides.length);
	const { graph, video, total } = filterGraph(durations);
	const output = path.join(outDir, `${short.id}.mp4`);
	const inputs = slides.flatMap((name, index) => [
		"-loop",
		"1",
		"-t",
		String(durations[index]),
		"-i",
		path.join(dir, name),
	]);
	const result = spawnSync(
		"ffmpeg",
		[
			"-v",
			"error",
			"-y",
			...inputs,
			"-i",
			path.join(musicDir, `${short.app.music}.m4a`),
			"-filter_complex",
			graph,
			"-map",
			`[${video}]`,
			"-map",
			"[a]",
			// crf 20 with a 3.5 Mb/s cap keeps a 21 s Short near 4 MB.
			...["-c:v", "libx264", "-preset", "medium", "-crf", "20"],
			...["-maxrate", "3500k", "-bufsize", "7000k", "-pix_fmt", "yuv420p"],
			...["-r", String(FPS), "-c:a", "aac", "-b:a", "160k"],
			...["-movflags", "+faststart", "-t", String(total), output],
		],
		{ stdio: "inherit" },
	);
	if (result.status !== 0) {
		throw new Error(`ffmpeg failed for ${short.id} (exit ${result.status})`);
	}
	const kb = Math.round(statSync(output).size / 1024);
	console.log(`${short.id}.mp4 ${total}s ${kb} KB`);
	return output;
}

if (isEntryPoint(import.meta.url)) {
	const ids = process.argv.slice(2);
	for (const id of ids.length > 0 ? ids : apps.map((app) => app.id)) {
		buildVideo(findShort(id));
	}
}
