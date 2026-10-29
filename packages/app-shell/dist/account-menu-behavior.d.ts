/**
 * What a `<details>` disclosure does not do by itself: close the account
 * menu when the user clicks outside it, presses Escape, tabs past it or
 * picks an item (a router link changes the page without a reload, so the
 * menu would stay open). Shared by the React AccountMenu and the script of
 * server-rendered pages (app-shell-enhance.js).
 */
/** Wires one menu; returns the function that unwires it. */
export declare function wireAccountMenu(menu: HTMLDetailsElement): () => void;
