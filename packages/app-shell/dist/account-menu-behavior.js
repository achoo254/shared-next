/**
 * What a `<details>` disclosure does not do by itself: close the account
 * menu when the user clicks outside it, presses Escape, tabs past it or
 * picks an item (a router link changes the page without a reload, so the
 * menu would stay open). Shared by the React AccountMenu and the script of
 * server-rendered pages (app-shell-enhance.js).
 */
/** Wires one menu; returns the function that unwires it. */
export function wireAccountMenu(menu) {
    const summary = menu.querySelector("summary");
    const close = () => {
        menu.open = false;
    };
    const onPointerDown = (event) => {
        if (menu.open && !menu.contains(event.target))
            close();
    };
    const onKeyDown = (event) => {
        if (event.key !== "Escape" || !menu.open)
            return;
        close();
        summary?.focus();
    };
    const onFocusOut = (event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && !menu.contains(next))
            close();
    };
    const onClick = (event) => {
        const target = event.target;
        // A submit button (sign out by POST) leaves the page anyway.
        if (target instanceof Element &&
            target.closest("a.shell-account-item, button.shell-account-item")) {
            if (target.closest('button[type="submit"]'))
                return;
            close();
        }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    menu.addEventListener("focusout", onFocusOut);
    menu.addEventListener("click", onClick);
    return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
        menu.removeEventListener("focusout", onFocusOut);
        menu.removeEventListener("click", onClick);
    };
}
