/**
 * Icons of the switcher. App entries show the AI-drawn app marks, data URIs
 * (src/marks.ts) loaded in their own chunk (src/mark-loader.ts), so no image
 * file is fetched and the marks stay out of the startup bundle; the button
 * keeps its inline 3×3 dots in currentColor.
 */
import type { AppSwitcherEntryId } from "./catalog.js";
/**
 * Mark of one catalog entry, decorative (the link text names it). Until the
 * marks are loaded an empty box of the same size holds its place.
 */
export declare function EntryIcon({ id }: {
    readonly id: AppSwitcherEntryId;
}): import("react").JSX.Element;
/** The 3×3 dots of the switcher button. */
export declare function GridIcon(): import("react").JSX.Element;
