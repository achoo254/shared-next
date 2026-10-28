import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LanguageSwitch } from "./language-switch.js";
import { SHELL_MESSAGES } from "./messages.js";
import { ShellAnchor, } from "./shell-link.js";
import { ThemeSwitch } from "./theme-switch.js";
function isAction(item) {
    return item.href === undefined;
}
export function PublicFooter(props) {
    const { brand, locale, linkComponent } = props;
    const t = SHELL_MESSAGES[locale];
    const items = [
        {
            href: props.privacyHref ?? "/privacy",
            label: t.privacy,
            dataId: "foot-privacy",
        },
        ...(props.termsHref === null
            ? []
            : [
                {
                    href: props.termsHref ?? "/terms",
                    label: t.terms,
                    dataId: "foot-terms",
                },
            ]),
        ...(props.footerLinks ?? []),
    ];
    // The header's links, on phones only, unless the footer has the place already.
    const hrefs = new Set(items.map((item) => item.href));
    const phoneLinks = props.hideNavOnPhones === true
        ? (props.navLinks ?? []).filter((link) => !hrefs.has(link.href))
        : [];
    const language = props.languageHref
        ? { languageHref: props.languageHref }
        : { onLocaleChange: props.onLocaleChange };
    const hasNote = props.footerNote !== undefined && props.footerNote !== null;
    return (_jsxs("footer", { className: "shell-foot shell-container", "data-id": "public-footer", children: [_jsxs("div", { className: "shell-foot-switches", children: [_jsx(LanguageSwitch, { ...language, locale: locale, locales: props.locales, domain: brand.domain }), _jsx(ThemeSwitch, { locale: locale, domain: brand.domain, legacyThemeKey: props.legacyThemeKey })] }), _jsxs("nav", { className: "shell-foot-links", "aria-label": t.footLinks, children: [_jsx("a", { className: "shell-foot-link", href: `https://${brand.domain}`, "data-id": "foot-home", children: t.ecosystem(brand.domain) }), phoneLinks.map((link) => (_jsx(ShellAnchor, { href: link.href, className: "shell-foot-link shell-only-phone", "data-id": `foot-${link.dataId}`, "aria-current": link.current === true ? "page" : undefined, linkComponent: linkComponent, children: link.label }, `nav-${link.dataId}`))), items.map((item) => isAction(item) ? (_jsx("button", { type: "button", className: "shell-foot-link", "data-id": item.dataId, onClick: item.onClick, children: item.label }, item.dataId)) : (_jsx(ShellAnchor, { href: item.href, className: "shell-foot-link", "data-id": item.dataId, "aria-current": item.current === true ? "page" : undefined, linkComponent: linkComponent, children: item.label }, item.dataId)))] }), hasNote ? (_jsx("p", { className: "shell-foot-note", "data-id": "foot-note", children: props.footerNote })) : null] }));
}
