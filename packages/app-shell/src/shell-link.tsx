/**
 * Content types every shell component shares, and the one anchor they all
 * render: the app's router link for its own paths, a plain `<a>` otherwise.
 */
import type { ComponentType, MouseEvent, ReactNode } from "react";

/** What the shell shows of the app; `@achoo254/brand` gives each field. */
export interface ShellBrand {
	/** `appName` of brand.config.json, shown bold next to the mark. */
	readonly appName: string;
	/** `primaryTenant.domain`: the ecosystem's root domain, e.g. hoandat.com. */
	readonly domain: string;
	/** URL of the app's AI mark (bundled asset or data URI), drawn at 24px. */
	readonly markSrc: string;
}

/** A header or footer link the app adds. */
export interface ShellLink {
	readonly href: string;
	readonly label: string;
	/** `data-id` of the link, e.g. "topbar-docs". */
	readonly dataId: string;
	/** Marks the link as the current page. */
	readonly current?: boolean | undefined;
	/** Header only: hidden on phones (< 480px), where room is short. */
	readonly hideOnPhones?: boolean | undefined;
}

/** Props the shell gives a router link component. */
export interface ShellAnchorProps {
	readonly href: string;
	readonly className: string;
	readonly children: ReactNode;
	readonly "data-id"?: string | undefined;
	readonly "aria-current"?: "page" | undefined;
	readonly onClick?:
		| ((event: MouseEvent<HTMLAnchorElement>) => void)
		| undefined;
}

/**
 * The app's link for its own paths, so they navigate without a reload,
 * e.g. `({ href, ...rest }) => <Link to={href} {...rest} />` for React
 * Router. It must render an `<a>` with every prop it gets.
 */
export type ShellLinkComponent = ComponentType<ShellAnchorProps>;

/** A path of this app ("/login"), not another origin ("//x", "https:"). */
function isAppPath(href: string): boolean {
	return href.startsWith("/") && !href.startsWith("//");
}

export function ShellAnchor({
	linkComponent: Link,
	...props
}: ShellAnchorProps & {
	readonly linkComponent?: ShellLinkComponent | undefined;
}): ReactNode {
	if (Link && isAppPath(props.href)) return <Link {...props} />;
	return <a {...props} />;
}

/** Joins class names, skipping empty ones. */
export function classes(
	...names: readonly (string | false | undefined)[]
): string {
	return names.filter(Boolean).join(" ");
}

/**
 * Click handler that hands the URL to `open` instead of following it (a
 * native shell opens sign-in in the system browser); none without `open`.
 */
export function handOver(
	href: string,
	open: ((href: string) => void) | undefined,
): ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined {
	if (!open) return undefined;
	return (event) => {
		event.preventDefault();
		open(href);
	};
}
