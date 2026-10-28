import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PublicFooter } from "./public-footer.js";
import { PublicHeader } from "./public-header.js";
export function PublicPage(props) {
    const { children, layout, ...rest } = props;
    return (_jsxs("div", { className: "shell", children: [_jsx(PublicHeader, { ...rest }), _jsx("main", { className: layout === "center"
                    ? "shell-main shell-container shell-main-center"
                    : "shell-main shell-container", children: children }), _jsx(PublicFooter, { ...rest })] }));
}
