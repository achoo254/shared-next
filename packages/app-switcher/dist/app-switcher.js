import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The 9-dot button and its popover of links to the tenant's other apps: a
 * non-modal <dialog> shown with the `open` attribute (never showModal, so
 * the page stays usable and the popover sits next to its button).
 * No inline styles (Scribe's CSP has no style-src 'unsafe-inline'), no
 * network: classes come from app-switcher.css, themed by CSS variables.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, } from "react";
import { EntryIcon, GridIcon } from "./icons.js";
import { appSwitcherLinks, resolveAppSwitcherLocale, } from "./links.js";
import { usePopoverDismiss } from "./use-popover-dismiss.js";
const BUTTON_LABEL = {
    en: "Switch app",
    vi: "Chuyển ứng dụng",
    "zh-CN": "切换应用",
};
const PANEL_LABEL = {
    en: "Apps",
    vi: "Ứng dụng",
    "zh-CN": "应用",
};
function safeLinks(options) {
    try {
        return { links: appSwitcherLinks(options) };
    }
    catch (error) {
        return { links: [], error };
    }
}
export function AppSwitcher(props) {
    const { current, tenantDomain, isPrimaryTenant, onOpen } = props;
    const locale = resolveAppSwitcherLocale(props.locale);
    const panelId = useId();
    const [open, setOpen] = useState(false);
    const root = useRef(null);
    const trigger = useRef(null);
    const panel = useRef(null);
    const close = useCallback(() => setOpen(false), []);
    const refs = useMemo(() => ({ root, trigger, panel }), []);
    usePopoverDismiss(open, close, refs);
    const { links, error } = useMemo(() => safeLinks({ current, tenantDomain, isPrimaryTenant, locale }), [current, tenantDomain, isPrimaryTenant, locale]);
    useEffect(() => {
        // A wrong tenant domain hides the switcher; the app keeps working.
        if (error !== undefined)
            console.error(error);
    }, [error]);
    if (links.length === 0)
        return null;
    function follow(event, href) {
        setOpen(false);
        if (!onOpen)
            return;
        event.preventDefault();
        onOpen(href);
    }
    const rootClass = ["sn-app-switcher", props.className]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("div", { ref: root, className: rootClass, "data-placement": props.placement ?? "bottom-end", children: [_jsx("button", { ref: trigger, type: "button", className: "sn-app-switcher__button", "aria-label": BUTTON_LABEL[locale], title: BUTTON_LABEL[locale], "aria-expanded": open, "aria-controls": panelId, onClick: () => setOpen((value) => !value), children: _jsx(GridIcon, {}) }), _jsx("dialog", { ref: panel, id: panelId, "aria-label": PANEL_LABEL[locale], className: "sn-app-switcher__panel", open: open, children: _jsx("ul", { className: "sn-app-switcher__list", children: links.map((link) => (_jsx("li", { "data-entry": link.id, children: _jsxs("a", { className: "sn-app-switcher__link", href: link.href, onClick: (event) => follow(event, link.href), children: [_jsx(EntryIcon, { id: link.id }), _jsxs("span", { className: "sn-app-switcher__text", children: [_jsx("span", { className: "sn-app-switcher__label", children: link.label }), _jsx("span", { className: "sn-app-switcher__description", children: link.description })] })] }) }, link.id))) }) })] }));
}
