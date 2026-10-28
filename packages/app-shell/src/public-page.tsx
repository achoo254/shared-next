/**
 * A whole signed-out page: header, the app's body in the shared container,
 * footer, on the grid backdrop of the account app. Renders the same on a
 * server (renderToStaticMarkup) as in the browser.
 */
import type { ReactNode } from "react";
import { PublicFooter, type PublicFooterProps } from "./public-footer.js";
import { PublicHeader, type PublicHeaderProps } from "./public-header.js";

export type PublicPageProps = PublicHeaderProps &
	PublicFooterProps & {
		readonly children: ReactNode;
		/**
		 * "flow" (default): the body from the top, for welcome and legal pages;
		 * "center": one card centred in the page, for /login.
		 */
		readonly layout?: "flow" | "center" | undefined;
	};

export function PublicPage(props: PublicPageProps): ReactNode {
	const { children, layout, ...rest } = props;
	return (
		<div className="shell">
			<PublicHeader {...rest} />
			<main
				className={
					layout === "center"
						? "shell-main shell-container shell-main-center"
						: "shell-main shell-container"
				}
			>
				{children}
			</main>
			<PublicFooter {...rest} />
		</div>
	);
}
