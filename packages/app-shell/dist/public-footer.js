import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LanguageSwitch } from "./language-switch.js";
import { SHELL_MESSAGES } from "./messages.js";
import { ShellAnchor, } from "./shell-link.js";
import { ThemeSwitch } from "./theme-switch.js";
export function PublicFooter(props) {
    const { brand, locale, linkComponent } = props;
    const t = SHELL_MESSAGES[locale];
    const links = [
        {
            href: props.privacyHref ?? "/privacy",
            label: t.privacy,
            dataId: "foot-privacy",
        },
        { href: props.termsHref ?? "/terms", label: t.terms, dataId: "foot-terms" },
        ...(props.footerLinks ?? []),
    ];
    const language = props.languageHref
        ? { languageHref: props.languageHref }
        : { onLocaleChange: props.onLocaleChange };
    return (_jsxs("footer", { className: "shell-foot shell-container", "data-id": "public-footer", children: [_jsxs("div", { className: "shell-foot-switches", children: [_jsx(LanguageSwitch, { ...language, locale: locale, domain: brand.domain }), _jsx(ThemeSwitch, { locale: locale, domain: brand.domain, legacyThemeKey: props.legacyThemeKey })] }), _jsxs("nav", { className: "shell-foot-links", "aria-label": t.footLinks, children: [_jsx("a", { className: "shell-foot-link", href: `https://${brand.domain}`, "data-id": "foot-home", children: t.ecosystem(brand.domain) }), links.map((link) => (_jsx(ShellAnchor, { href: link.href, className: "shell-foot-link", "data-id": link.dataId, "aria-current": link.current === true ? "page" : undefined, linkComponent: linkComponent, children: link.label }, link.dataId)))] })] }));
}
