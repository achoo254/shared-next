/**
 * Under every signed-out page, in the same place on every app: the
 * language pill and the theme switch, then one quiet row of links ("An
 * app from <domain>", privacy, terms, then the app's own links and
 * buttons), then the app's note if it has one.
 */
import type { ReactNode } from "react";
import { type LanguageSwitchMode } from "./language-switch.js";
import type { ShellLocale } from "./locale.js";
import { type ShellAction, type ShellBrand, type ShellLink, type ShellLinkComponent } from "./shell-link.js";
export type PublicFooterProps<L extends ShellLocale = ShellLocale> = LanguageSwitchMode<L> & {
    readonly brand: ShellBrand;
    readonly locale: L;
    /** "/privacy" by default. */
    readonly privacyHref?: string | undefined;
    /** "/terms" by default. */
    readonly termsHref?: string | undefined;
    /**
     * After the shared links: links (Docs, Delete account) and buttons
     * (`{ label, dataId, onClick }`, e.g. Feedback opening a form).
     */
    readonly footerLinks?: readonly (ShellLink | ShellAction)[] | undefined;
    /** A short line of the app under the links, e.g. "For entertainment". */
    readonly footerNote?: ReactNode;
    /**
     * The header's links (PublicPage passes them): with `hideNavOnPhones`
     * they are repeated here on phones, where the header hides them.
     */
    readonly navLinks?: readonly ShellLink[] | undefined;
    readonly hideNavOnPhones?: boolean | undefined;
    /** The app's localStorage key of the theme before the shared cookie. */
    readonly legacyThemeKey?: string | undefined;
    readonly linkComponent?: ShellLinkComponent | undefined;
    /** The app's languages in switch order; vi and en by default. */
    readonly locales?: readonly L[] | undefined;
};
export declare function PublicFooter<L extends ShellLocale = ShellLocale>(props: PublicFooterProps<L>): ReactNode;
