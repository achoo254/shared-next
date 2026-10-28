/**
 * Light / dark / system switch. The choice goes into the shared `hd_theme`
 * cookie (preferences.ts) and onto `<html data-theme>`; every switch on the
 * page, and the page itself when it comes back into view after a choice in
 * another app, follows the stored value.
 */
import { type ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { type PreferenceOptions, type ThemePreference } from "./preferences.js";
export interface ThemeSwitchProps {
    readonly locale: ShellLocale;
    /** The brand's root domain, for the shared cookie. */
    readonly domain: string;
    /** The app's localStorage key of the theme before the shared cookie. */
    readonly legacyThemeKey?: string | undefined;
}
/**
 * The stored theme. A change made elsewhere (another tab or app) is applied
 * to the page when it is noticed; nothing is applied on mount, where the
 * head script (themeBootstrapScript) has already set it.
 */
export declare function useThemePreference(options: PreferenceOptions): ThemePreference;
export declare function ThemeSwitch(props: ThemeSwitchProps): ReactNode;
