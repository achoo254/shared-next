/**
 * App marks inlined as data URIs, so the switcher fetches no file (the
 * consumer CSP needs `data:` in img-src). Sources: assets/marks/*-mark-64.webp,
 * the AI-drawn 64 px rounded marks; test/marks.test.ts keeps both in step.
 * The account entry shows the ecosystem (hoandat) mark.
 */
import type { AppSwitcherEntryId } from "./catalog.js";
export declare const APP_MARKS: Readonly<Record<AppSwitcherEntryId, string>>;
