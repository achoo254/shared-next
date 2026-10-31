/**
 * Shown to a guest right after their first real use of an app (a chart
 * made, a quest done, a video rendered): what a free Hoandat account keeps
 * for them, in the app's own words, and the same sign-up call to action as
 * the header. One card, no dismiss logic: the app decides when it shows.
 */
import type { ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { type ShellBrand, type ShellLinkComponent } from "./shell-link.js";
export interface AccountValueCardProps {
    readonly brand: ShellBrand;
    readonly locale: ShellLocale;
    readonly signInHref: string;
    /** App copy: what the account keeps, e.g. "Lưu lá số để xem lại mỗi ngày". At most three. */
    readonly benefits: readonly ReactNode[];
    /** Opens sign-in instead of following the link (system browser in a native shell). */
    readonly onSignIn?: ((href: string) => void) | undefined;
    readonly linkComponent?: ShellLinkComponent | undefined;
}
export declare function AccountValueCard(props: AccountValueCardProps): ReactNode;
