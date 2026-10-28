/**
 * The sign-in card of every app: the app's title and line, then the one
 * call to action, "Sign in with <domain>", on a single line down to the
 * narrowest phone, and a note on how the account page signs people in.
 * No "create account" button: the account page creates the account.
 */
import type { ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { type ShellBrand, type ShellLinkComponent } from "./shell-link.js";
export interface SignInCardProps {
    readonly brand: ShellBrand;
    readonly locale: ShellLocale;
    readonly signInHref: string;
    /** App copy, e.g. "Sign in to Scribe". */
    readonly title: ReactNode;
    /** App copy under the title. */
    readonly description?: ReactNode;
    /** 1 (default) on its own page; 2 beside a Hero, whose title is the h1. */
    readonly headingLevel?: 1 | 2 | undefined;
    /** Opens sign-in instead of following the link (system browser in a native shell). */
    readonly onSignIn?: ((href: string) => void) | undefined;
    /**
     * The app's router link. Not for the CTA when `signInHref` is a server
     * route (`/api/auth/login`): the router would try to render it.
     */
    readonly linkComponent?: ShellLinkComponent | undefined;
    /**
     * Sign-in has started and not come back yet (e.g. the system browser is
     * open): the CTA is busy and ignores clicks, with the same label.
     */
    readonly pending?: boolean | undefined;
    /** After the note, e.g. an error from the last sign-in. */
    readonly children?: ReactNode;
}
export declare function SignInCard(props: SignInCardProps): ReactNode;
