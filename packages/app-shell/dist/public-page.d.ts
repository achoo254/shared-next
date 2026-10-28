/**
 * A whole signed-out page: header, the app's body in the shared container,
 * footer, on the grid backdrop of the account app. Renders the same on a
 * server (renderToStaticMarkup) as in the browser.
 */
import type { ReactNode } from "react";
import { type PublicFooterProps } from "./public-footer.js";
import { type PublicHeaderProps } from "./public-header.js";
export type PublicPageProps = PublicHeaderProps & PublicFooterProps & {
    readonly children: ReactNode;
    /**
     * "flow" (default): the body from the top, for welcome and legal pages;
     * "center": one card centred in the page, for /login.
     */
    readonly layout?: "flow" | "center" | undefined;
};
export declare function PublicPage(props: PublicPageProps): ReactNode;
