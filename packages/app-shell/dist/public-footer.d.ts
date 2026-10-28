/**
 * Under every signed-out page, in the same place on every app: the
 * language pill and the theme switch, then one quiet row of links ("An
 * app from <domain>", privacy, terms, then the app's own).
 */
import type { ReactNode } from "react";
import { type LanguageSwitchMode } from "./language-switch.js";
import type { ShellLocale } from "./locale.js";
import { type ShellBrand, type ShellLink, type ShellLinkComponent } from "./shell-link.js";
export type PublicFooterProps = LanguageSwitchMode & {
    readonly brand: ShellBrand;
    readonly locale: ShellLocale;
    /** "/privacy" by default. */
    readonly privacyHref?: string | undefined;
    /** "/terms" by default. */
    readonly termsHref?: string | undefined;
    /** After the shared links, e.g. Docs or Delete account. */
    readonly footerLinks?: readonly ShellLink[] | undefined;
    /** The app's localStorage key of the theme before the shared cookie. */
    readonly legacyThemeKey?: string | undefined;
    readonly linkComponent?: ShellLinkComponent | undefined;
    /** The app's languages in switch order; vi and en by default. */
    readonly locales?: readonly ShellLocale[] | undefined;
};
export declare function PublicFooter(props: PublicFooterProps): ReactNode;
