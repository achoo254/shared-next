/**
 * Icons of the switcher. App entries show the AI-drawn app marks, data URIs
 * (src/marks.ts) loaded in their own chunk (src/mark-loader.ts), so no image
 * file is fetched and the marks stay out of the startup bundle; the button
 * keeps its inline 3×3 dots in currentColor.
 */
import type { AppSwitcherEntryId } from "./catalog.js";
import { useAppMarks } from "./mark-loader.js";

/**
 * Mark of one catalog entry, decorative (the link text names it). Until the
 * marks are loaded an empty box of the same size holds its place.
 */
export function EntryIcon({ id }: { readonly id: AppSwitcherEntryId }) {
	const marks = useAppMarks();
	if (!marks) {
		return <span className="sn-app-switcher__icon" aria-hidden="true" />;
	}
	return (
		<img
			className="sn-app-switcher__icon"
			src={marks[id]}
			alt=""
			width={22}
			height={22}
		/>
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
