/**
 * Words of the shared chrome, owned here so no app can word them
 * differently. App copy (titles, ledes, features) comes from props.
 */
import type { ShellLocale } from "./locale.js";
import type { ThemePreference } from "./preferences.js";
export interface ShellMessages {
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
}
export declare const SHELL_MESSAGES: Readonly<Record<ShellLocale, ShellMessages>>;
