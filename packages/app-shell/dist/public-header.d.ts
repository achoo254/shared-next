/**
 * Sticky top bar of every signed-out page, as on the account app
 * (auth-next src/ui/layout.ts): the app's AI mark and bold name linking
 * home, the app's few links, then the sign-in pill, or the app's account
 * controls once the visitor is signed in.
 *
 * Room on phones (< 480px): the mark, the whole app name, at most one short
 * link and the sign-in pill or one account control. More than that and the
 * name would be cut, so mark the other links `hideOnPhones`, or pass
 * `hideNavOnPhones` to move every link into the footer on phones.
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
    /**
     * Hides every link of `navLinks` on phones (< 480px), where the app name
     * needs the room; PublicPage repeats them in the footer there.
     */
    readonly hideNavOnPhones?: boolean | undefined;
    /**
     * Replaces the sign-in pill for a signed-in visitor (open app, account
     * menu, a sign-out button with class `shell-topbar-link`). `null` shows
     * nothing there (sign-in not available); left out, the pill shows.
     */
    readonly accountSlot?: ReactNode;
    /** Target of the mark and name; "/" by default. */
    readonly homeHref?: string | undefined;
    readonly linkComponent?: ShellLinkComponent | undefined;
}
export declare function PublicHeader(props: PublicHeaderProps): ReactNode;
