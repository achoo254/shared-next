import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import { SHELL_LOCALES, SHELL_LOCALE_NAMES, } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import { writePreference } from "./preferences.js";
export function LanguageSwitch(props) {
    const { locale, domain, languageHref, onLocaleChange } = props;
    const label = SHELL_MESSAGES[locale].language;
    const options = SHELL_LOCALES.map((option) => {
        const common = {
            className: "shell-lang-option",
            lang: option,
            "data-id": `lang-${option}`,
            children: SHELL_LOCALE_NAMES[option],
        };
        if (languageHref) {
            return (_createElement("a", { ...common, key: option, href: languageHref(option), hrefLang: option, "aria-current": option === locale ? "true" : undefined }));
        }
        return (_createElement("button", { ...common, key: option, type: "button", "aria-pressed": option === locale, onClick: () => {
                writePreference("lang", option, { domain });
                onLocaleChange?.(option);
            } }));
    });
    if (languageHref) {
        return (_jsx("nav", { className: "shell-lang-switch", "aria-label": label, "data-id": "lang-switch", children: options }));
    }
    return (_jsxs("fieldset", { className: "shell-lang-switch", "data-id": "lang-switch", children: [_jsx("legend", { className: "shell-sr-only", children: label }), options] }));
}
