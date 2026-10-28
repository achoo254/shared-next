/**
 * The language pill: one option per language of the app, the current one
 * marked. In an app it is a fieldset of buttons that store the shared
 * `hd_lang` cookie and tell the app; on a page without script (auth-next)
 * it is a nav of links to a URL that sets the cookie on the server.
 */
import type { ReactNode } from "react";
import { type ShellLocale } from "./locale.js";
/**
 * How a pick reaches the app: a callback, or a link per language. `L` is
 * the app's languages (its `locales`), so a vi/en app passes its own
 * `(locale: "vi" | "en") => void`.
 */
export type LanguageSwitchMode<L extends ShellLocale = ShellLocale> = {
    /** Called after the choice is stored; the app re-renders in it. */
    readonly onLocaleChange: (locale: L) => void;
    readonly languageHref?: undefined;
} | {
    /** The URL that switches to a language (a server route). */
    readonly languageHref: (locale: L) => string;
    readonly onLocaleChange?: undefined;
};
export type LanguageSwitchProps<L extends ShellLocale = ShellLocale> = LanguageSwitchMode<L> & {
    readonly locale: L;
    /** The brand's root domain, for the shared cookie. */
    readonly domain: string;
    /**
     * The app's languages in switch order; vi and en by default. Localman
     * and the account app pass `["en", "zh-CN", "vi"]`. Pass them whenever
     * `L` is not vi and en, so the callback only gets the app's own.
     */
    readonly locales?: readonly L[] | undefined;
};
export declare function LanguageSwitch<L extends ShellLocale = ShellLocale>(props: LanguageSwitchProps<L>): ReactNode;
