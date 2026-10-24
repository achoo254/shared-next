/**
 * Light-dismiss and focus handling of an open popover: Esc closes and puts
 * focus back on the trigger, a pointer press outside closes without moving
 * focus, and Tab / Shift+Tab cycle inside the panel (focus trap).
 */
import { type RefObject } from "react";
export interface PopoverDismissRefs {
    /** Wraps the trigger and the panel: presses inside it never dismiss. */
    readonly root: RefObject<HTMLElement | null>;
    readonly trigger: RefObject<HTMLElement | null>;
    readonly panel: RefObject<HTMLElement | null>;
}
export declare function usePopoverDismiss(open: boolean, close: () => void, refs: PopoverDismissRefs): void;
