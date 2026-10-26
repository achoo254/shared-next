import { jsx as _jsx } from "react/jsx-runtime";
import { useAppMarks } from "./mark-loader.js";
/**
 * Mark of one catalog entry, decorative (the link text names it). Until the
 * marks are loaded an empty box of the same size holds its place.
 */
export function EntryIcon({ id }) {
    const marks = useAppMarks();
    if (!marks) {
        return _jsx("span", { className: "sn-app-switcher__icon", "aria-hidden": "true" });
    }
    return (_jsx("img", { className: "sn-app-switcher__icon", src: marks[id], alt: "", width: 22, height: 22 }));
}
const GRID = [5, 12, 19];
/** The 3×3 dots of the switcher button. */
export function GridIcon() {
    return (_jsx("svg", { className: "sn-app-switcher__grid", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", focusable: "false", children: GRID.flatMap((y) => GRID.map((x) => _jsx("circle", { cx: x, cy: y, r: "2" }, `${x}-${y}`))) }));
}
