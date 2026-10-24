/**
 * Inline line icons, 24×24 in currentColor (no image request: Scribe's CSP
 * allows images from its own origin only). App shapes match auth-next's
 * /apps page; stroke width comes from the stylesheet.
 */
import type { ReactNode } from "react";
import type { AppSwitcherEntryId } from "./catalog.js";

const SHAPES: Readonly<Record<AppSwitcherEntryId, ReactNode>> = {
	chat: (
		<>
			<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
			<path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
		</>
	),
	scribe: (
		<>
			<rect x="9" y="3" width="6" height="11" rx="3" />
			<path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
		</>
	),
	localman: (
		<>
			<path d="M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1" />
			<circle cx="12" cy="12" r="1.5" />
		</>
	),
	tunelo: (
		<path d="M3 20V12a9 9 0 0 1 18 0v8M7 20v-8a5 5 0 0 1 10 0v8M3 20h18" />
	),
	account: (
		<>
			<circle cx="12" cy="12" r="9" />
			<circle cx="12" cy="10" r="3" />
			<path d="M6.2 18.4a6.5 6.5 0 0 1 11.6 0" />
		</>
	),
};

/** Icon of one catalog entry, decorative (the link text names it). */
export function EntryIcon({ id }: { readonly id: AppSwitcherEntryId }) {
	return (
		<svg
			className="sn-app-switcher__icon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{SHAPES[id]}
		</svg>
	);
}

const GRID = [5, 12, 19];

/** The 3×3 dots of the switcher button. */
export function GridIcon() {
	return (
		<svg
			className="sn-app-switcher__grid"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
		>
			{GRID.flatMap((y) =>
				GRID.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />),
			)}
		</svg>
	);
}
