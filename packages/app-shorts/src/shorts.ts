// A Short is what gets rendered, joined and posted: its slides, music, title and description. Overview
// Shorts present one app (id = app id); feature Shorts present one feature (id = feature id).
import {
	type AppShort,
	DIRECTORY_URL,
	apps,
	describe as describeOverview,
} from "./apps.ts";
import { type Feature, features } from "./features.ts";
import {
	contentSlide,
	hookSlide,
	introSlide,
	outroSlide,
	pointsSlide,
} from "./slides.ts";

export interface Short {
	id: string;
	app: AppShort;
	/** HTML of each slide, built on demand because it inlines every image. */
	slides(): string[];
	title: string;
	description: string;
}

export function overviewShort(app: AppShort): Short {
	return {
		id: app.id,
		app,
		slides: () => [
			introSlide(app),
			...app.slides.map((slide) => contentSlide(app, slide)),
			outroSlide(app),
		],
		title: app.title,
		description: describeOverview(app),
	};
}

/** The tagged link of a feature Short: its own campaign, the feature in `utm_content`. */
export function featureLink(feature: Feature): string {
	const query = new URLSearchParams({
		utm_source: "youtube",
		utm_medium: "social",
		utm_campaign: "feature-short",
		utm_content: feature.id,
	});
	return `https://${feature.app.host}/?${query}`;
}

export function featureShort(feature: Feature): Short {
	const { app, visual, points } = feature;
	const heading = visual.sub ? `${visual.title}: ${visual.sub}` : visual.title;
	return {
		id: feature.id,
		app,
		slides: () => [
			hookSlide(app, feature.hook),
			contentSlide(app, visual),
			pointsSlide(app, visual.title, points),
			outroSlide(app),
		],
		title: `${app.name}: ${visual.title} #Shorts`,
		description: [
			feature.hook,
			`${heading}\n${points.map((point) => `• ${point}`).join("\n")}`,
			`${app.cta}: ${featureLink(feature)}\nĐăng nhập bằng Google hoặc GitHub qua tài khoản hoandat.`,
			`Các app khác của Hoandat Apps: ${DIRECTORY_URL}`,
			app.hashtags.map((tag) => `#${tag}`).join(" "),
		].join("\n\n"),
	};
}

export const shorts: Short[] = [
	...apps.map(overviewShort),
	...features.map(featureShort),
];

export function findShort(id: string): Short {
	const short = shorts.find((candidate) => candidate.id === id);
	if (!short) {
		throw new Error(
			`unknown Short "${id}"; one of ${shorts.map((s) => s.id).join(", ")}`,
		);
	}
	return short;
}
