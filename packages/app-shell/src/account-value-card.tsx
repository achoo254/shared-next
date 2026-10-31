/**
 * Shown to a guest right after their first real use of an app (a chart
 * made, a quest done, a video rendered): what a free Hoandat account keeps
 * for them, in the app's own words, and the same sign-up call to action as
 * the header. One card, no dismiss logic: the app decides when it shows.
 */
import type { ReactNode } from "react";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import {
	ShellAnchor,
	type ShellBrand,
	type ShellLinkComponent,
	handOver,
} from "./shell-link.js";

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

export function AccountValueCard(props: AccountValueCardProps): ReactNode {
	const t = SHELL_MESSAGES[props.locale];
	return (
		<aside className="shell-card shell-value-card" data-id="account-value-card">
			<p className="shell-value-title">{t.valueTitle(props.brand.domain)}</p>
			<ul className="shell-value-list">
				{props.benefits.slice(0, 3).map((benefit, i) => (
					// The app's benefits are a fixed list: position is their identity.
					// biome-ignore lint/suspicious/noArrayIndexKey: static list
					<li key={i}>{benefit}</li>
				))}
				<li>{t.valueEveryApp(props.brand.domain)}</li>
			</ul>
			<ShellAnchor
				href={props.signInHref}
				className="shell-btn shell-btn-primary shell-btn-cta"
				data-id="account-value-cta"
				onClick={handOver(props.signInHref, props.onSignIn)}
				linkComponent={props.linkComponent}
			>
				{t.signUp}
			</ShellAnchor>
		</aside>
	);
}
