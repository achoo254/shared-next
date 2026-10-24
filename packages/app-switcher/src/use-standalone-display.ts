/**
 * Whether the page runs as an installed PWA (its own window, no browser UI).
 * A link followed there loads the other app inside this app's window, so the
 * switcher opens it in a new browsing context instead.
 * False on the server and where `matchMedia` is missing; read through
 * useSyncExternalStore so hydration matches the server render, then updates.
 */
import { useSyncExternalStore } from "react";

const STANDALONE_QUERY = "(display-mode: standalone)";

function standaloneQuery(): MediaQueryList | undefined {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function")
		return undefined;
	return window.matchMedia(STANDALONE_QUERY);
}

function subscribe(onChange: () => void): () => void {
	const query = standaloneQuery();
	query?.addEventListener("change", onChange);
	return () => query?.removeEventListener("change", onChange);
}

function isStandalone(): boolean {
	return standaloneQuery()?.matches ?? false;
}

function onServer(): boolean {
	return false;
}

export function useStandaloneDisplay(): boolean {
	return useSyncExternalStore(subscribe, isStandalone, onServer);
}
