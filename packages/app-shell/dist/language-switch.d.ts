/**
 * The language pill: one option per shell language, the current one
 * marked. In an app it is a fieldset of buttons that store the shared
 * `hd_lang` cookie and tell the app; on a page without script (auth-next)
 * it is a nav of links to a URL that sets the cookie on the server.
 */
import type { ReactNode } from "react";
import { type ShellLocale } from "./locale.js";
/** How a pick reaches the app: a callback, or a link per language. */
export type LanguageSwitchMode = {
    /** Called after the choice is stored; the app re-renders in it. */
    readonly onLocaleChange: (locale: ShellLocale) => void;
    readonly languageHref?: undefined;
} | {
    /** The URL that switches to a language (a server route). */
    readonly languageHref: (locale: ShellLocale) => string;
    readonly onLocaleChange?: undefined;
};
export type LanguageSwitchProps = LanguageSwitchMode & {
    readonly locale: ShellLocale;
    /** The brand's root domain, for the shared cookie. */
    readonly domain: string;
};
export declare function LanguageSwitch(props: LanguageSwitchProps): ReactNode;
