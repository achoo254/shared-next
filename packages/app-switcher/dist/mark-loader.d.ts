import type { AppSwitcherEntryId } from "./catalog.js";
export type AppMarks = Readonly<Record<AppSwitcherEntryId, string>>;
/** Starts loading the marks once; a failed load can be retried. */
export declare function loadAppMarks(): Promise<AppMarks>;
/** The marks once loaded, undefined until then (and on the server). */
export declare function useAppMarks(): AppMarks | undefined;
