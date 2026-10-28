/**
 * Sticky top bar of every signed-out page, as on the account app
 * (auth-next src/ui/layout.ts): the app's AI mark and bold name linking
 * home, the app's few links, then the sign-in pill, or the app's account
 * controls once the visitor is signed in.
 */
import type { ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { type ShellBrand, type ShellLink, type ShellLinkComponent } from "./shell-link.js";
export interface PublicHeaderProps {
    readonly brand: ShellBrand;
    readonly locale: ShellLocale;
    /** Where the sign-in pill goes: the app's /login or the IdP URL. */
    readonly signInHref: string;
    /** Marks the sign-in pill as the current page (on /login). */
    readonly signInCurrent?: boolean | undefined;
    /** Opens sign-in instead of following the link (system browser in a native shell). */
    readonly onSignIn?: ((href: string) => void) | undefined;
    /** Links before the sign-in pill, e.g. Features or Docs. */
    readonly navLinks?: readonly ShellLink[] | undefined;
    /** Replaces the sign-in pill for a signed-in visitor (open app, account menu). */
    readonly accountSlot?: ReactNode;
    /** Target of the mark and name; "/" by default. */
    readonly homeHref?: string | undefined;
    readonly linkComponent?: ShellLinkComponent | undefined;
}
export declare function PublicHeader(props: PublicHeaderProps): ReactNode;
