/**
 * Loads the app marks (src/marks.ts, ~6 KB of base64 WebP) on demand: the
 * dynamic import() makes a separate chunk in the consumer's bundler, so the
 * marks stay out of the app's startup JavaScript. The switcher starts the
 * load when its button is hovered, focused or opened.
 */
import { useSyncExternalStore } from "react";
let marks;
let pending;
const listeners = new Set();
/** Starts loading the marks once; a failed load can be retried. */
export function loadAppMarks() {
    pending ??= import("./marks.js").then((module) => {
        marks = module.APP_MARKS;
        for (const listener of listeners)
            listener();
        return module.APP_MARKS;
    }, (error) => {
        pending = undefined;
        throw error;
    });
    return pending;
}
function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
/** The marks once loaded, undefined until then (and on the server). */
export function useAppMarks() {
    return useSyncExternalStore(subscribe, () => marks, () => undefined);
}
