/**
 * Loads the app marks (src/marks.ts, ~6 KB of base64 WebP) on demand: the
 * dynamic import() makes a separate chunk in the consumer's bundler, so the
 * marks stay out of the app's startup JavaScript. The switcher starts the
 * load when its button is hovered, focused or opened.
 */
import { useSyncExternalStore } from "react";
import type { AppSwitcherEntryId } from "./catalog.js";

export type AppMarks = Readonly<Record<AppSwitcherEntryId, string>>;

let marks: AppMarks | undefined;
let pending: Promise<AppMarks> | undefined;
const listeners = new Set<() => void>();

/** Starts loading the marks once; a failed load can be retried. */
export function loadAppMarks(): Promise<AppMarks> {
	pending ??= import("./marks.js").then(
		(module) => {
			marks = module.APP_MARKS;
			for (const listener of listeners) listener();
			return module.APP_MARKS;
		},
		(error: unknown) => {
			pending = undefined;
			throw error;
		},
	);
	return pending;
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/** The marks once loaded, undefined until then (and on the server). */
export function useAppMarks(): AppMarks | undefined {
	return useSyncExternalStore(
		subscribe,
		() => marks,
		() => undefined,
	);
}
