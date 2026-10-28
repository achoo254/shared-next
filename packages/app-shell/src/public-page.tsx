/**
 * A whole signed-out page: a skip link, header, the app's body in the
 * shared container, footer, on the grid backdrop of the account app.
 * Renders the same on a server (renderToStaticMarkup) as in the browser.
 */
import type { ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import { PublicFooter, type PublicFooterProps } from "./public-footer.js";
import { PublicHeader, type PublicHeaderProps } from "./public-header.js";

export type PublicPageProps<L extends ShellLocale = ShellLocale> =
	PublicHeaderProps &
		PublicFooterProps<L> & {
			readonly children: ReactNode;
			/**
			 * "flow" (default): the body from the top, for welcome and legal pages;
			 * "center": one card centred in the page, for /login.
			 */
			readonly layout?: "flow" | "center" | undefined;
			/** `id` of `<main>`, the skip link's target; "main" by default. */
			readonly mainId?: string | undefined;
		};

export function PublicPage<L extends ShellLocale = ShellLocale>(
	props: PublicPageProps<L>,
): ReactNode {
	const { children, layout, mainId = "main", ...rest } = props;
	return (
		<div className="shell">
			<a className="shell-skip-link" href={`#${mainId}`} data-id="skip-link">
				{SHELL_MESSAGES[props.locale].skipToContent}
			</a>
			<PublicHeader {...rest} />
			<main
				id={mainId}
				// Focusable by the skip link only, not in the tab order.
				tabIndex={-1}
				className={
					layout === "center"
						? "shell-main shell-container shell-main-center"
						: "shell-main shell-container"
				}
			>
				{children}
			</main>
			<PublicFooter<L> {...rest} />
		</div>
	);
}
