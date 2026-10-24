/**
 * Light-dismiss and focus handling of an open popover: Esc closes and puts
 * focus back on the trigger, a pointer press outside closes without moving
 * focus, and Tab / Shift+Tab cycle inside the panel (focus trap).
 */
import { type RefObject, useEffect } from "react";

const FOCUSABLE =
	'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface PopoverDismissRefs {
	/** Wraps the trigger and the panel: presses inside it never dismiss. */
	readonly root: RefObject<HTMLElement | null>;
	readonly trigger: RefObject<HTMLElement | null>;
	readonly panel: RefObject<HTMLElement | null>;
}

function focusables(panel: HTMLElement): HTMLElement[] {
	return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

export function usePopoverDismiss(
	open: boolean,
	close: () => void,
	refs: PopoverDismissRefs,
): void {
	const { root, trigger, panel } = refs;

	useEffect(() => {
		if (!open) return;
		const first = panel.current ? focusables(panel.current)[0] : undefined;
		first?.focus();

		function onKeyDown(event: KeyboardEvent): void {
			if (event.key === "Escape") {
				event.preventDefault();
				close();
				trigger.current?.focus();
				return;
			}
			if (event.key !== "Tab" || !panel.current) return;
			const items = focusables(panel.current);
			const head = items[0];
			const tail = items[items.length - 1];
			if (!head || !tail) return;
			const active = document.activeElement;
			const inside = active instanceof Node && panel.current.contains(active);
			if (event.shiftKey && (active === head || !inside)) {
				event.preventDefault();
				tail.focus();
			} else if (!event.shiftKey && (active === tail || !inside)) {
				event.preventDefault();
				head.focus();
			}
		}

		function onPointerDown(event: PointerEvent): void {
			const target = event.target;
			if (target instanceof Node && root.current?.contains(target)) return;
			close();
		}

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open, close, root, trigger, panel]);
}
