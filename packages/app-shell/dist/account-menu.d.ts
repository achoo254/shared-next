/**
 * Avatar button and account menu of a signed-in user, as on Localman's top
 * bar: the IdP picture (or the first letter of the name) and the name, then
 * a menu with the name and email, the app's own entries, the IdP account
 * pages and sign-out. Goes in PublicHeader's `accountSlot` or the app's own
 * top bar.
 *
 * A `<details>` disclosure, so it opens with no script on a server-rendered
 * page; account-menu-behavior.ts closes it on an outside click, Escape,
 * tabbing away or a chosen item (wired here in React, by
 * app-shell-enhance.js on a page without React).
 */
import { type ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { type ShellLinkComponent } from "./shell-link.js";
/** What the app knows of the signed-in user; any field may be missing. */
export interface ShellUser {
    /** Display name (or username) from the IdP. */
    readonly name?: string | null | undefined;
    readonly email?: string | null | undefined;
    /** IdP picture URL; only `https:` ones are shown. */
    readonly picture?: string | null | undefined;
}
/** An entry of the app: a link (`href`) or an action (`onClick`). */
export interface AccountMenuEntry {
    readonly label: string;
    /** `data-id` of the item, e.g. "account-menu-settings". */
    readonly dataId: string;
    readonly href?: string | undefined;
    readonly onClick?: (() => void) | undefined;
    /** A 16px decorative icon. */
    readonly icon?: ReactNode;
}
/**
 * How the app signs out: a POST form (server sessions with a CSRF field),
 * or a callback (an API call, a native shell).
 */
export type AccountSignOut = {
    readonly action: string;
    /** Hidden fields of the form, e.g. the CSRF token. */
    readonly fields?: Readonly<Record<string, string>> | undefined;
} | {
    readonly onClick: () => void;
    /** Disables the item while signing out. */
    readonly busy?: boolean | undefined;
};
export interface AccountMenuProps {
    readonly user: ShellUser;
    readonly locale: ShellLocale;
    /** The brand's root domain (hoandat.com), named in the IdP heading. */
    readonly domain: string;
    /**
     * The IdP account page ("https://auth.hoandat.com/account"), whose
     * sections the menu links to in a new tab; `null` leaves the group out
     * (on the IdP itself).
     */
    readonly idpAccountUrl: string | null;
    /** The app's entries, one group per array, separated by a rule. */
    readonly entries?: readonly (readonly AccountMenuEntry[])[] | undefined;
    readonly signOut: AccountSignOut;
    /** Opens an IdP link instead of a new tab (system browser in a native shell). */
    readonly onOpenExternal?: ((href: string) => void) | undefined;
    readonly linkComponent?: ShellLinkComponent | undefined;
}
export declare function AccountMenu(props: AccountMenuProps): ReactNode;
