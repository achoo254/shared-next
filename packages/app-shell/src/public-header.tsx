/**
 * Sticky top bar of every signed-out page, as on the account app
 * (auth-next src/ui/layout.ts): the app's AI mark and bold name linking
 * home, the app's few links, then the sign-in pill, or the app's account
 * controls once the visitor is signed in.
 */
import type { ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import {
	ShellAnchor,
	type ShellBrand,
	type ShellLink,
	type ShellLinkComponent,
	classes,
	handOver,
} from "./shell-link.js";

export interface PublicHeaderProps {
	readonly brand: ShellBrand;
	readonly locale: ShellLocale;
	/** Where the sign-in pill goes: the app's /login or the IdP URL. */
	readonly signInHref: string;
	/** Marks the sign-in pill as the current page (on /login). */
	readonly signInCurrent?: boolean | undefined;
	/** Opens sign-in instead of following the link (system browser in a native shell). */
	readonly onSignIn?: ((href: string) => void) | undefined;
	/** Links before the sign-in pill, e.g. Features or Docs. */
	readonly navLinks?: readonly ShellLink[] | undefined;
	/** Replaces the sign-in pill for a signed-in visitor (open app, account menu). */
	readonly accountSlot?: ReactNode;
	/** Target of the mark and name; "/" by default. */
	readonly homeHref?: string | undefined;
	readonly linkComponent?: ShellLinkComponent | undefined;
}

export function PublicHeader(props: PublicHeaderProps): ReactNode {
	const { brand, linkComponent, navLinks = [] } = props;
	const t = SHELL_MESSAGES[props.locale];
	return (
		<header className="shell-topbar" data-id="public-header">
			<div className="shell-topbar-inner shell-container">
				<ShellAnchor
					href={props.homeHref ?? "/"}
					className="shell-brand"
					data-id="public-home"
					linkComponent={linkComponent}
				>
					<img
						className="shell-brand-mark"
						src={brand.markSrc}
						width={24}
						height={24}
						alt=""
						aria-hidden="true"
					/>
					<b className="shell-brand-name">{brand.appName}</b>
				</ShellAnchor>
				<div className="shell-topbar-end">
					{navLinks.length > 0 ? (
						<nav className="shell-topbar-nav" aria-label={t.nav}>
							{navLinks.map((link) => (
								<ShellAnchor
									key={link.dataId}
									href={link.href}
									className={classes(
										"shell-topbar-link",
										link.hideOnPhones === true && "shell-hide-phone",
									)}
									data-id={link.dataId}
									aria-current={link.current === true ? "page" : undefined}
									linkComponent={linkComponent}
								>
									{link.label}
								</ShellAnchor>
							))}
						</nav>
					) : null}
					{props.accountSlot ?? (
						<ShellAnchor
							href={props.signInHref}
							className="shell-topbar-link shell-topbar-cta"
							data-id="public-sign-in"
							aria-current={props.signInCurrent === true ? "page" : undefined}
							onClick={handOver(props.signInHref, props.onSignIn)}
							linkComponent={linkComponent}
						>
							{t.signIn}
						</ShellAnchor>
					)}
				</div>
			</div>
		</header>
	);
}
