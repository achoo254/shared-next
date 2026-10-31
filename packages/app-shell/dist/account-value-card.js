import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SHELL_MESSAGES } from "./messages.js";
import { ShellAnchor, handOver, } from "./shell-link.js";
export function AccountValueCard(props) {
    const t = SHELL_MESSAGES[props.locale];
    return (_jsxs("aside", { className: "shell-card shell-value-card", "data-id": "account-value-card", children: [_jsx("p", { className: "shell-value-title", children: t.valueTitle(props.brand.domain) }), _jsxs("ul", { className: "shell-value-list", children: [props.benefits.slice(0, 3).map((benefit, i) => (_jsx("li", { children: benefit }, i))), _jsx("li", { children: t.valueEveryApp(props.brand.domain) })] }), _jsx(ShellAnchor, { href: props.signInHref, className: "shell-btn shell-btn-primary shell-btn-cta", "data-id": "account-value-cta", onClick: handOver(props.signInHref, props.onSignIn), linkComponent: props.linkComponent, children: t.signUp })] }));
}
