import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SHELL_MESSAGES } from "./messages.js";
import { PublicFooter } from "./public-footer.js";
import { PublicHeader } from "./public-header.js";
export function PublicPage(props) {
    const { children, layout, mainId = "main", ...rest } = props;
    return (_jsxs("div", { className: "shell", children: [_jsx("a", { className: "shell-skip-link", href: `#${mainId}`, "data-id": "skip-link", children: SHELL_MESSAGES[props.locale].skipToContent }), _jsx(PublicHeader, { ...rest }), _jsx("main", { id: mainId, 
                // Focusable by the skip link only, not in the tab order.
                tabIndex: -1, className: layout === "center"
                    ? "shell-main shell-container shell-main-center"
                    : "shell-main shell-container", children: children }), _jsx(PublicFooter, { ...rest })] }));
}
