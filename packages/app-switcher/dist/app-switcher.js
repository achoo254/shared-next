import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The 9-dot button and its popover of links to the other apps: a
 * non-modal <dialog> shown with the `open` attribute (never showModal, so
 * the page stays usable and the popover sits next to its button).
 * No inline styles (Scribe's CSP has no style-src 'unsafe-inline'): classes
 * come from app-switcher.css, themed by CSS variables. The only request is
 * the app's own chunk of app marks, loaded when the button is hovered,
 * focused or opened.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, } from "react";
import { EntryIcon, GridIcon } from "./icons.js";
import { appSwitcherLinks, resolveAppSwitcherLocale, } from "./links.js";
import { loadAppMarks } from "./mark-loader.js";
import { usePopoverDismiss } from "./use-popover-dismiss.js";
import { useStandaloneDisplay } from "./use-standalone-display.js";
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
/** Fetches the marks chunk; a failure only leaves the placeholders. */
function prefetchMarks() {
    loadAppMarks().catch((error) => console.error(error));
}
function safeLinks(options) {
    try {
        return { links: appSwitcherLinks(options) };
    }
    catch (error) {
        return { links: [], error };
    }
}
export function AppSwitcher(props) {
    const { current, domain, onOpen } = props;
    const locale = resolveAppSwitcherLocale(props.locale);
    const panelId = useId();
    const [open, setOpen] = useState(false);
    const root = useRef(null);
    const trigger = useRef(null);
    const panel = useRef(null);
    const close = useCallback(() => setOpen(false), []);
    const refs = useMemo(() => ({ root, trigger, panel }), []);
    usePopoverDismiss(open, close, refs);
    // An installed PWA would load the other app in its own window.
    const newContext = useStandaloneDisplay() && !onOpen;
    const { links, error } = useMemo(() => safeLinks({ current, domain, locale }), [current, domain, locale]);
    useEffect(() => {
        // A wrong domain hides the switcher; the app keeps working.
        if (error !== undefined)
            console.error(error);
    }, [error]);
    useEffect(() => {
        if (open)
            prefetchMarks();
    }, [open]);
    if (links.length === 0)
        return null;
    function follow(event, href) {
        setOpen(false);
        if (!onOpen)
            return;
        event.preventDefault();
        // The page stays: focus goes back to the button, as on Esc.
        trigger.current?.focus();
        onOpen(href);
    }
    const rootClass = ["sn-app-switcher", props.className]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("div", { ref: root, className: rootClass, "data-placement": props.placement ?? "bottom-end", children: [_jsx("button", { ref: trigger, type: "button", className: "sn-app-switcher__button", "aria-label": BUTTON_LABEL[locale], title: BUTTON_LABEL[locale], "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": panelId, onClick: () => setOpen((value) => !value), onPointerEnter: prefetchMarks, onFocus: prefetchMarks, children: _jsx(GridIcon, {}) }), _jsx("dialog", { ref: panel, id: panelId, "aria-label": PANEL_LABEL[locale], className: "sn-app-switcher__panel", open: open, children: _jsx("ul", { className: "sn-app-switcher__list", children: links.map((link) => (_jsx("li", { "data-entry": link.id, children: _jsxs("a", { className: "sn-app-switcher__link", href: link.href, target: newContext ? "_blank" : undefined, rel: newContext ? "noopener" : undefined, onClick: (event) => follow(event, link.href), children: [_jsx(EntryIcon, { id: link.id }), _jsxs("span", { className: "sn-app-switcher__text", children: [_jsx("span", { className: "sn-app-switcher__label", children: link.label }), _jsx("span", { className: "sn-app-switcher__description", children: link.description })] })] }) }, link.id))) }) })] }));
}
