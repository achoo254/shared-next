import { type AppSwitcherLinksOptions } from "./links.js";
/** Where the panel opens: under a header button, or beside a side rail. */
export type AppSwitcherPlacement = "bottom-end" | "right-end";
export interface AppSwitcherProps extends AppSwitcherLinksOptions {
    /**
     * Opens a link instead of the browser following it, e.g. in the system
     * browser from a native shell. Without it the link is a plain `<a href>`.
     */
    readonly onOpen?: ((url: string) => void) | undefined;
    readonly placement?: AppSwitcherPlacement | undefined;
    /** Extra class on the root, for the app's own layout. */
    readonly className?: string | undefined;
}
export declare function AppSwitcher(props: AppSwitcherProps): import("react").JSX.Element | null;
