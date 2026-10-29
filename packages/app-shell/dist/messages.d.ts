/**
 * Words of the shared chrome, owned here so no app can word them
 * differently. App copy (titles, ledes, features) comes from props.
 */
import type { ShellLocale } from "./locale.js";
import type { ThemePreference } from "./preferences.js";
export interface ShellMessages {
    /** First stop of the keyboard: jumps past the header to the page body. */
    readonly skipToContent: string;
    /** Accessible name of the header links. */
    readonly nav: string;
    /** The header pill. */
    readonly signIn: string;
    /** The one call to action of the sign-in card. */
    readonly signInWith: (domain: string) => string;
    /** Under the call to action: how the sign-in page signs people in. */
    readonly signInNote: (domain: string) => string;
    /** First footer link, to the ecosystem's home page. */
    readonly ecosystem: (domain: string) => string;
    readonly privacy: string;
    readonly terms: string;
    readonly footLinks: string;
    readonly language: string;
    readonly theme: string;
    readonly themes: Readonly<Record<ThemePreference, string>>;
    /** Name of a signed-in user the app knows nothing about. */
    readonly account: string;
    /** Accessible name of the avatar button. */
    readonly accountTrigger: (name: string) => string;
    /** Heading of the account menu's links to the IdP account pages. */
    readonly idpHeading: (domain: string) => string;
    readonly idpEmail: string;
    readonly idpSignIn: string;
    /** Read after each IdP link: where it opens. */
    readonly opensIdp: (domain: string) => string;
    readonly signOut: string;
}
export declare const SHELL_MESSAGES: Readonly<Record<ShellLocale, ShellMessages>>;
