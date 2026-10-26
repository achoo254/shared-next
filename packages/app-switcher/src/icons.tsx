/**
 * Icons of the switcher. App entries show the AI-drawn app marks, inlined as
 * data URIs (src/marks.ts) so no file is fetched; the button keeps its inline
 * 3×3 dots in currentColor.
 */
import type { AppSwitcherEntryId } from "./catalog.js";
import { APP_MARKS } from "./marks.js";

/** Mark of one catalog entry, decorative (the link text names it). */
export function EntryIcon({ id }: { readonly id: AppSwitcherEntryId }) {
	return (
		<img
			className="sn-app-switcher__icon"
			src={APP_MARKS[id]}
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
