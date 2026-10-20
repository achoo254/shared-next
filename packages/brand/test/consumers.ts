/**
 * How each product calls the package, with the options that reproduce the
 * manifests it has committed (fixtures/<product>/generated, copied from each
 * repository's HEAD). The fixtures hold neutral placeholder icons
 * (fixtures/placeholder), never the product logos. The README's consumer
 * examples mirror these.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	type IconRenderer,
	type JsonIndent,
	type ManifestIcon,
	type RenderRequest,
	type RequirableField,
	type WriteBrandFilesOptions,
	svgManifestIcons,
} from "../src/build.js";
import type { BrandConfig } from "../src/index.js";

export type ConsumerName = "chat" | "scribe" | "localman" | "miu";

export interface Consumer {
	readonly name: ConsumerName;
	/** Fixture directory: the product's brand root (brand.config.json, icons). */
	readonly root: URL;
	readonly generatedDir: URL;
	readonly require: readonly RequirableField[];
	readonly indent: JsonIndent;
	/** Whether the product draws its icons from SVGs (else pre-rendered PNGs). */
	readonly rastersIcons: boolean;
	readonly manifests: (
		brand: BrandConfig,
	) => WriteBrandFilesOptions["manifests"];
}

const FIXTURES = new URL("./fixtures/", import.meta.url);
/** Placeholder SVGs, their real Chromium renders and the recorded hashes. */
export const PLACEHOLDER = new URL("placeholder/", FIXTURES);

/** sha256 of each drawn icon file, from a real Chromium render of the placeholders. */
export function recordedIconHashes(): Record<string, string> {
	const parsed: unknown = JSON.parse(
		readFileSync(new URL("icons.sha256.json", PLACEHOLDER), "utf8"),
	);
	if (typeof parsed !== "object" || parsed === null) {
		throw new Error("icons.sha256.json is not an object");
	}
	return Object.fromEntries(
		Object.entries(parsed).map(([file, hash]) => [file, String(hash)]),
	);
}

/**
 * Hands back the recorded Chromium renders of the placeholders, picked by
 * the requested SVG's content and size (so a request sent for the wrong
 * icon gets the wrong image and fails the hash comparison).
 */
export function placeholderRenderer(seen: RenderRequest[]): IconRenderer {
	const sources = (["icon", "icon-maskable"] as const).map((name) => ({
		name,
		svg: readFileSync(new URL(`${name}.svg`, PLACEHOLDER)),
	}));
	return async (requests) => {
		seen.push(...requests);
		return requests.map((request) => {
			const source = sources.find(
				(candidate) => Buffer.compare(candidate.svg, request.svg) === 0,
			);
			if (source === undefined) {
				throw new Error(`${request.path} is not a placeholder SVG`);
			}
			return new Uint8Array(
				readFileSync(
					new URL(`renders/${source.name}-${request.size}.png`, PLACEHOLDER),
				),
			);
		});
	};
}

function fixture(name: ConsumerName): { root: URL; generatedDir: URL } {
	const root = new URL(`${name}/`, FIXTURES);
	return { root, generatedDir: new URL("generated/", root) };
}

/**
 * miu-world-next packages/brand/src/icons.ts: the logo PNGs `pnpm
 * assets:logo` renders, listed by the product (their names are its own).
 */
function miuManifestIcons(brand: BrandConfig): readonly ManifestIcon[] {
	return [
		{ file: "generated/brand/miu-logo-192.png", size: 192, purpose: "any" },
		{ file: brand.icon, size: 512, purpose: "any" },
		{ file: brand.iconMaskable, size: 512, purpose: "maskable" },
	].map((icon) => ({
		src: icon.file,
		sizes: `${icon.size}x${icon.size}`,
		type: "image/png",
		purpose: icon.purpose,
	}));
}

export const CONSUMERS: readonly Consumer[] = [
	{
		name: "chat",
		...fixture("chat"),
		require: [
			"sharedDomains",
			"devOrigins",
			"pushSenderName",
			"appIds.android",
			"colors.primary",
			"colors.backgroundDark",
		],
		indent: 2,
		rastersIcons: true,
		manifests: () => ({
			web: {
				id: "/",
				lang: "vi",
				dir: "ltr",
				themeColor: "primary",
				categories: ["social"],
				preferRelatedApplications: false,
				icons: svgManifestIcons(),
			},
			capacitor: true,
		}),
	},
	{
		name: "scribe",
		...fixture("scribe"),
		require: ["colors.primary", "colors.backgroundDark"],
		indent: 2,
		rastersIcons: true,
		manifests: () => ({
			web: {
				id: "/",
				lang: "vi",
				dir: "ltr",
				// The <meta name="theme-color"> scribe keeps on the page background.
				themeColor: "background",
				categories: ["productivity"],
				preferRelatedApplications: false,
				// scribe serves the brand SVG at /favicon.svg, the URL it always linked.
				icons: svgManifestIcons("favicon.svg"),
			},
			// capacitor.config.ts spreads only appId and appName.
			capacitor: { urlScheme: false },
		}),
	},
	{
		name: "localman",
		...fixture("localman"),
		require: [
			"webInstall",
			"appIds.android",
			"colors.primary",
			"colors.backgroundDark",
		],
		indent: "\t",
		rastersIcons: true,
		manifests: () => ({
			web: {
				id: "/",
				lang: "en",
				dir: "ltr",
				themeColor: "primary",
				categories: ["productivity", "utilities"],
				preferRelatedApplications: false,
				icons: svgManifestIcons(),
			},
			capacitor: true,
		}),
	},
	{
		name: "miu",
		...fixture("miu"),
		require: ["colors.theme", "appIds.android"],
		indent: 2,
		rastersIcons: false,
		manifests: (brand) => ({
			web: {
				lang: "vi",
				display: "fullscreen",
				orientation: "any",
				themeColor: "theme",
				icons: miuManifestIcons(brand),
			},
			capacitor: true,
		}),
	},
];

export function consumer(name: ConsumerName): Consumer {
	const found = CONSUMERS.find((candidate) => candidate.name === name);
	if (found === undefined) throw new Error(`no consumer ${name}`);
	return found;
}

/** The fixture's brand.config.json, parsed but not validated. */
export function rawConfig(name: ConsumerName): unknown {
	return JSON.parse(
		readFileSync(new URL("brand.config.json", fixture(name).root), "utf8"),
	);
}

/** Paths of every file under `dir`, relative to it with `/`, sorted. */
export function filesUnder(dir: URL): string[] {
	const base = fileURLToPath(dir);
	const found: string[] = [];
	const walk = (full: string): void => {
		for (const name of readdirSync(full).sort()) {
			const child = path.join(full, name);
			if (statSync(child).isDirectory()) walk(child);
			else found.push(path.relative(base, child).split(path.sep).join("/"));
		}
	};
	walk(base);
	return found.sort();
}

/** The PNG images packed in an .ico file, by size. */
export function decodeIco(
	ico: Uint8Array,
): { size: number; png: Uint8Array }[] {
	const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
	const count = view.getUint16(4, true);
	return Array.from({ length: count }, (_, index) => {
		const entry = 6 + 16 * index;
		const size = view.getUint8(entry) || 256;
		const length = view.getUint32(entry + 8, true);
		const offset = view.getUint32(entry + 12, true);
		return { size, png: ico.slice(offset, offset + length) };
	});
}
