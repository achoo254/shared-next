import { jsx as _jsx } from "react/jsx-runtime";
import { APP_MARKS } from "./marks.js";
/** Mark of one catalog entry, decorative (the link text names it). */
export function EntryIcon({ id }) {
    return (_jsx("img", { className: "sn-app-switcher__icon", src: APP_MARKS[id], alt: "", width: 22, height: 22 }));
}
const GRID = [5, 12, 19];
/** The 3×3 dots of the switcher button. */
export function GridIcon() {
    return (_jsx("svg", { className: "sn-app-switcher__grid", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", focusable: "false", children: GRID.flatMap((y) => GRID.map((x) => _jsx("circle", { cx: x, cy: y, r: "2" }, `${x}-${y}`))) }));
}
