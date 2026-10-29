import { jsx as _jsx } from "react/jsx-runtime";
const PATHS = {
    chevronDown: ["M6 9l6 6l6 -6"],
    mail: [
        "M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z",
        "M3 7l9 6l9 -6",
    ],
    user: [
        "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0",
        "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2",
    ],
    logout: [
        "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2",
        "M9 12h12l-3 -3",
        "M18 15l3 -3",
    ],
    externalLink: [
        "M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6",
        "M11 13l9 -9",
        "M15 4h5v5",
    ],
};
export function AccountIcon({ name, size = 16, }) {
    return (_jsx("svg", { className: "shell-icon", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: PATHS[name].map((d) => (_jsx("path", { d: d }, d))) }));
}
