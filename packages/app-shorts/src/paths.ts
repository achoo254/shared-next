// Where the generator finds what it reads from the sibling repositories: store screenshots and
// icons of each app, Miu World's CC0 music pack, and the Chromium of Miu World's Playwright (this
// package installs no browser of its own, like `@shared-next/brand`).
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const packageDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

/** The folder holding chat-next, scribe-next, localman-next, miu-world-next and shared-next side by side. */
export const workspaceDir =
	process.env.HOANDAT_APPS_DIR ?? path.resolve(packageDir, "../../..");

/** Rendered slides and finished videos; not committed. */
export const outDir = path.join(packageDir, "out");

export const musicDir = path.join(
	workspaceDir,
	"miu-world-next/assets/generated/music",
);

export function inWorkspace(relative: string): string {
	return path.join(workspaceDir, relative);
}

export function inPackage(relative: string): string {
	return path.join(packageDir, relative);
}

/** The few Playwright calls the slide renderer makes. */
export interface Chromium {
	launch(): Promise<{
		newContext(options: {
			viewport: { width: number; height: number };
			deviceScaleFactor: number;
		}): Promise<{
			newPage(): Promise<{
				setContent(
					html: string,
					options: { waitUntil: "networkidle" },
				): Promise<void>;
				evaluate(fn: () => unknown): Promise<unknown>;
				screenshot(options: { path: string }): Promise<unknown>;
			}>;
		}>;
		close(): Promise<void>;
	}>;
}

export function loadChromium(): Chromium {
	const require = createRequire(inWorkspace("miu-world-next/package.json"));
	return (require("@playwright/test") as { chromium: Chromium }).chromium;
}

/** True when the module at `moduleUrl` is the script node was started with. */
export function isEntryPoint(moduleUrl: string): boolean {
	const started = process.argv[1];
	return (
		started !== undefined &&
		path.resolve(started) === path.resolve(fileURLToPath(moduleUrl))
	);
}
