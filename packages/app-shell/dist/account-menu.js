import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Avatar button and account menu of a signed-in user, as on Localman's top
 * bar: the IdP picture (or the first letter of the name) and the name, then
 * a menu with the name and email, the app's own entries, the IdP account
 * pages and sign-out. Goes in PublicHeader's `accountSlot` or the app's own
 * top bar.
 *
 * A `<details>` disclosure, so it opens with no script on a server-rendered
 * page; account-menu-behavior.ts closes it on an outside click, Escape,
 * tabbing away or a chosen item (wired here in React, by
 * app-shell-enhance.js on a page without React).
 */
import { useEffect, useRef } from "react";
import { AccountIcon } from "./account-icons.js";
import { wireAccountMenu } from "./account-menu-behavior.js";
import { SHELL_MESSAGES } from "./messages.js";
import { ShellAnchor, handOver, } from "./shell-link.js";
/** The IdP account sections Localman's menu links to. */
const IDP_SECTIONS = [
    { id: "email", hash: "account-email", icon: "mail" },
    { id: "sign-in", hash: "account-sign-in", icon: "user" },
];
/** The name shown: display name, then email, then the word "Account". */
function shownName(user, fallback) {
    return user.name?.trim() || user.email?.trim() || fallback;
}
function Avatar({ name, picture, }) {
    if (picture?.startsWith("https://")) {
        return (_jsx("img", { className: "shell-avatar", src: picture, width: 28, height: 28, alt: "", referrerPolicy: "no-referrer" }));
    }
    // Drawn by CSS so the letter is not part of the button's visible text
    // (axe label-content-name-mismatch).
    const initial = name.normalize("NFD").charAt(0).toUpperCase();
    return (_jsx("span", { className: "shell-avatar shell-avatar-initial", "data-initial": initial, "aria-hidden": "true" }));
}
function EntryItem({ entry, linkComponent, }) {
    const content = (_jsxs(_Fragment, { children: [entry.icon, _jsx("span", { className: "shell-account-label", children: entry.label })] }));
    if (entry.href !== undefined) {
        return (_jsx(ShellAnchor, { href: entry.href, className: "shell-account-item", "data-id": entry.dataId, linkComponent: linkComponent, onClick: entry.onClick, children: content }));
    }
    return (_jsx("button", { type: "button", className: "shell-account-item", "data-id": entry.dataId, onClick: entry.onClick, children: content }));
}
function SignOutItem({ signOut, label, }) {
    const content = (_jsxs(_Fragment, { children: [_jsx(AccountIcon, { name: "logout" }), _jsx("span", { className: "shell-account-label", children: label })] }));
    if ("action" in signOut) {
        return (_jsxs("form", { className: "shell-account-form", method: "post", action: signOut.action, children: [Object.entries(signOut.fields ?? {}).map(([name, value]) => (_jsx("input", { type: "hidden", name: name, value: value }, name))), _jsx("button", { type: "submit", className: "shell-account-item", "data-id": "account-menu-sign-out", children: content })] }));
    }
    return (_jsx("button", { type: "button", className: "shell-account-item", "data-id": "account-menu-sign-out", disabled: signOut.busy === true, "aria-busy": signOut.busy === true ? true : undefined, onClick: signOut.onClick, children: content }));
}
export function AccountMenu(props) {
    const { user, domain, idpAccountUrl, entries = [], linkComponent } = props;
    const t = SHELL_MESSAGES[props.locale];
    const name = shownName(user, t.account);
    const email = user.email?.trim();
    const menu = useRef(null);
    useEffect(() => {
        const element = menu.current;
        return element ? wireAccountMenu(element) : undefined;
    }, []);
    const groups = entries.filter((group) => group.length > 0);
    return (_jsxs("details", { ref: menu, className: "shell-account", "data-id": "account-menu", children: [_jsxs("summary", { className: "shell-account-trigger", "data-id": "topbar-account", "aria-label": t.accountTrigger(name), children: [_jsx(Avatar, { name: name, picture: user.picture }), _jsx("span", { className: "shell-account-name", children: name }), _jsx(AccountIcon, { name: "chevronDown" })] }), _jsxs("div", { className: "shell-account-panel", children: [_jsxs("div", { className: "shell-account-head", children: [_jsx("span", { className: "shell-account-head-name", children: name }), email && email !== name ? (_jsx("span", { className: "shell-account-head-email", children: email })) : null] }), groups.map((group) => (_jsx("div", { className: "shell-account-group", children: group.map((entry) => (_jsx(EntryItem, { entry: entry, linkComponent: linkComponent }, entry.dataId))) }, group[0]?.dataId))), idpAccountUrl !== null ? (_jsxs("div", { className: "shell-account-group", children: [_jsx("span", { className: "shell-account-heading", children: t.idpHeading(domain) }), IDP_SECTIONS.map((section) => {
                                const href = `${idpAccountUrl}#${section.hash}`;
                                return (_jsxs("a", { href: href, target: "_blank", rel: "noopener noreferrer", className: "shell-account-item", "data-id": `account-menu-idp-${section.id}`, onClick: handOver(href, props.onOpenExternal), children: [_jsx(AccountIcon, { name: section.icon }), _jsxs("span", { className: "shell-account-label", children: [section.id === "email" ? t.idpEmail : t.idpSignIn, _jsx("span", { className: "shell-sr-only", children: t.opensIdp(domain) })] }), _jsx(AccountIcon, { name: "externalLink", size: 14 })] }, section.id));
                            })] })) : null, _jsx("div", { className: "shell-account-group", children: _jsx(SignOutItem, { signOut: props.signOut, label: t.signOut }) })] })] }));
}
