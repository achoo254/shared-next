/**
 * Icons of the switcher. App entries show the AI-drawn app marks, inlined as
 * data URIs (src/marks.ts) so no file is fetched; the button keeps its inline
 * 3×3 dots in currentColor.
 */
import type { AppSwitcherEntryId } from "./catalog.js";
/** Mark of one catalog entry, decorative (the link text names it). */
export declare function EntryIcon({ id }: {
    readonly id: AppSwitcherEntryId;
}): import("react").JSX.Element;
/** The 3×3 dots of the switcher button. */
export declare function GridIcon(): import("react").JSX.Element;
