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
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, } from "react";
import { crossSellSuggestion } from "./cross-sell.js";
import { EntryIcon, GridIcon } from "./icons.js";
import { appSwitcherLinks, resolveAppSwitcherLocale, } from "./links.js";
import { loadAppMarks } from "./mark-loader.js";
import { readHiddenSuggestion, storeHiddenSuggestion, } from "./suggestion-dismissal.js";
import { usePopoverDismiss } from "./use-popover-dismiss.js";
import { useStandaloneDisplay } from "./use-standalone-display.js";
const BUTTON_LABEL = {
    en: "Switch app",
    vi: "Chuyển ứng dụng",
    "zh-CN": "切换应用",
};
/** Heading above the first app of each group. */
const GROUP_HEADING = {
    tools: { en: "Tools", vi: "Công cụ", "zh-CN": "工具" },
    fun: { en: "Entertainment", vi: "Giải trí", "zh-CN": "娱乐" },
    learn: { en: "Learning", vi: "Học tập", "zh-CN": "学习" },
};
const PANEL_LABEL = {
    en: "Apps",
    vi: "Ứng dụng",
    "zh-CN": "应用",
};
/** Badge of the app suggested for this one (cross-sell.ts). */
const SUGGESTED_BADGE = {
    en: "Suggested",
    vi: "Gợi ý",
    "zh-CN": "推荐",
};
/** Name of the small button that hides the badge, before the app's name. */
const HIDE_SUGGESTION = {
    en: "Hide suggestion",
    vi: "Ẩn gợi ý",
    "zh-CN": "隐藏推荐",
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
    const [hiddenSuggestion, setHiddenSuggestion] = useState(readHiddenSuggestion);
    const suggest = hiddenSuggestion !== crossSellSuggestion(current);
    const { links, error } = useMemo(() => safeLinks({ current, domain, locale, suggest }), [current, domain, locale, suggest]);
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
    /** Hides the badge for good; focus moves to the app's link, which stays. */
    function hideSuggestion(event, id) {
        event.currentTarget.parentElement?.querySelector("a")?.focus();
        storeHiddenSuggestion(id);
        setHiddenSuggestion(id);
    }
    const rootClass = ["sn-app-switcher", props.className]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("div", { ref: root, className: rootClass, "data-placement": props.placement ?? "bottom-end", children: [_jsx("button", { ref: trigger, type: "button", className: "sn-app-switcher__button", "aria-label": BUTTON_LABEL[locale], title: BUTTON_LABEL[locale], "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": panelId, onClick: () => setOpen((value) => !value), onPointerEnter: prefetchMarks, onFocus: prefetchMarks, children: _jsx(GridIcon, {}) }), _jsx("dialog", { ref: panel, id: panelId, "aria-label": PANEL_LABEL[locale], className: "sn-app-switcher__panel", open: open, children: _jsx("ul", { className: "sn-app-switcher__list", children: links.map((link, index) => (_jsxs(Fragment, { children: [link.group && link.group !== links[index - 1]?.group ? (_jsx("li", { className: "sn-app-switcher__heading", role: "presentation", children: GROUP_HEADING[link.group][locale] })) : null, _jsxs("li", { "data-entry": link.id, children: [_jsxs("a", { className: "sn-app-switcher__link", href: link.href, target: newContext ? "_blank" : undefined, rel: newContext ? "noopener" : undefined, "data-suggested": link.suggested ? "" : undefined, onClick: (event) => follow(event, link.href), children: [_jsx(EntryIcon, { id: link.id }), _jsxs("span", { className: "sn-app-switcher__text", children: [_jsxs("span", { className: "sn-app-switcher__label", children: [link.label, link.suggested ? (_jsx("span", { className: "sn-app-switcher__badge", children: SUGGESTED_BADGE[locale] })) : null] }), _jsx("span", { className: "sn-app-switcher__description", children: link.description })] })] }), link.suggested ? (_jsx("button", { type: "button", className: "sn-app-switcher__hide", "aria-label": `${HIDE_SUGGESTION[locale]}: ${link.label}`, title: HIDE_SUGGESTION[locale], onClick: (event) => hideSuggestion(event, link.id), children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) })) : null] })] }, link.id))) }) })] }));
}
