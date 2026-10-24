import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const SHAPES = {
    chat: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" }), _jsx("path", { d: "M8.5 12h.01M12 12h.01M15.5 12h.01" })] })),
    scribe: (_jsxs(_Fragment, { children: [_jsx("rect", { x: "9", y: "3", width: "6", height: "11", rx: "3" }), _jsx("path", { d: "M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" })] })),
    localman: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1" }), _jsx("circle", { cx: "12", cy: "12", r: "1.5" })] })),
    tunelo: (_jsx("path", { d: "M3 20V12a9 9 0 0 1 18 0v8M7 20v-8a5 5 0 0 1 10 0v8M3 20h18" })),
    account: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("circle", { cx: "12", cy: "10", r: "3" }), _jsx("path", { d: "M6.2 18.4a6.5 6.5 0 0 1 11.6 0" })] })),
};
/** Icon of one catalog entry, decorative (the link text names it). */
export function EntryIcon({ id }) {
    return (_jsx("svg", { className: "sn-app-switcher__icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: SHAPES[id] }));
}
const GRID = [5, 12, 19];
/** The 3×3 dots of the switcher button. */
export function GridIcon() {
    return (_jsx("svg", { className: "sn-app-switcher__grid", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", focusable: "false", children: GRID.flatMap((y) => GRID.map((x) => _jsx("circle", { cx: x, cy: y, r: "2" }, `${x}-${y}`))) }));
}
