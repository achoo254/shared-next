import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Light / dark / system switch. The choice goes into the shared `hd_theme`
 * cookie (preferences.ts) and onto `<html data-theme>`; every switch on the
 * page, and the page itself when it comes back into view after a choice in
 * another app, follows the stored value.
 */
import { useCallback, useSyncExternalStore } from "react";
import { SHELL_MESSAGES } from "./messages.js";
import { THEME_PREFERENCES, applyTheme, readPreferences, subscribePreferences, writePreference, } from "./preferences.js";
import { ThemeIcon } from "./theme-icons.js";
/** A server render (and the first hydrating one) cannot read the cookie. */
const serverTheme = () => "system";
/**
 * The stored theme. A change made elsewhere (another tab or app) is applied
 * to the page when it is noticed; nothing is applied on mount, where the
 * head script (themeBootstrapScript) has already set it.
 */
export function useThemePreference(options) {
    const { domain, legacyThemeKey } = options;
    const subscribe = useCallback((onChange) => subscribePreferences(() => {
        applyTheme(readPreferences({ domain, legacyThemeKey }).theme);
        onChange();
    }), [domain, legacyThemeKey]);
    return useSyncExternalStore(subscribe, () => readPreferences({ domain, legacyThemeKey }).theme, serverTheme);
}
export function ThemeSwitch(props) {
    const { locale, domain, legacyThemeKey } = props;
    const t = SHELL_MESSAGES[locale];
    const current = useThemePreference({ domain, legacyThemeKey });
    function pick(theme) {
        writePreference("theme", theme, { domain });
        applyTheme(theme);
    }
    return (_jsxs("fieldset", { className: "shell-theme-switch", "data-id": "theme-switch", children: [_jsx("legend", { className: "shell-sr-only", children: t.theme }), THEME_PREFERENCES.map((theme) => (_jsx("button", { type: "button", className: "shell-theme-option", value: theme, "aria-label": t.themes[theme], title: t.themes[theme], "aria-pressed": theme === current, "data-id": `theme-${theme}`, onClick: () => pick(theme), children: _jsx(ThemeIcon, { theme: theme }) }, theme)))] }));
}
