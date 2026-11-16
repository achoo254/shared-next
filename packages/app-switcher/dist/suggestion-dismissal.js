/**
 * Remembers that the user hid the switcher's "Suggested" badge, in this
 * app's localStorage (each app has its own origin, so hiding it in one app
 * leaves the others' suggestion alone). The stored value is the app that
 * was suggested: when the pairing changes, the new suggestion shows again.
 * Storage can be missing or refuse (private mode, blocked cookies): the
 * badge then simply shows, and hiding it lasts until the page reloads.
 */
const STORAGE_KEY = "sn-app-switcher:hidden-suggestion";
/** The suggestion the user hid, or null. */
export function readHiddenSuggestion() {
    try {
        return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    }
    catch {
        return null;
    }
}
/** Stores the hidden suggestion; a refusing storage is ignored. */
export function storeHiddenSuggestion(id) {
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, id);
    }
    catch {
        // Not remembered across reloads; the badge stays hidden on this page.
    }
}
