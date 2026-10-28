import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SHELL_MESSAGES } from "./messages.js";
import { ShellAnchor, handOver, } from "./shell-link.js";
export function SignInCard(props) {
    const { brand, signInHref } = props;
    const t = SHELL_MESSAGES[props.locale];
    const Heading = props.headingLevel === 2 ? "h2" : "h1";
    const pending = props.pending === true;
    return (_jsxs("section", { className: "shell-card shell-sign-in-card", "data-id": "sign-in-card", children: [_jsxs("div", { className: "shell-sign-in-head", children: [_jsx(Heading, { className: "shell-card-title", children: props.title }), props.description === undefined ? null : (_jsx("p", { className: "shell-card-sub", children: props.description }))] }), _jsx(ShellAnchor, { href: signInHref, className: "shell-btn shell-btn-primary shell-btn-cta", "data-id": "sign-in-cta", "aria-busy": pending ? true : undefined, "aria-disabled": pending ? true : undefined, onClick: pending ? ignoreClick : handOver(signInHref, props.onSignIn), linkComponent: props.linkComponent, children: t.signInWith(brand.domain) }), _jsx("p", { className: "shell-card-note", children: t.signInNote(brand.domain) }), props.children] }));
}
/** A link cannot be disabled; while sign-in is pending it goes nowhere. */
function ignoreClick(event) {
    event.preventDefault();
}
