/**
 * Icons of the account menu: inline outline SVG in currentColor (the Tabler
 * shapes Localman's menu uses), decorative because every item has its text.
 */
import type { ReactNode } from "react";
declare const PATHS: {
    readonly chevronDown: readonly ["M6 9l6 6l6 -6"];
    readonly mail: readonly ["M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z", "M3 7l9 6l9 -6"];
    readonly user: readonly ["M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"];
    readonly logout: readonly ["M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2", "M9 12h12l-3 -3", "M18 15l3 -3"];
    readonly externalLink: readonly ["M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6", "M11 13l9 -9", "M15 4h5v5"];
};
export type AccountIconName = keyof typeof PATHS;
export declare function AccountIcon({ name, size, }: {
    readonly name: AccountIconName;
    readonly size?: number;
}): ReactNode;
export {};
