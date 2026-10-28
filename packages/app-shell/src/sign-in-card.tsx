/**
 * The sign-in card of every app: the app's title and line, then the one
 * call to action, "Sign in with <domain>", on a single line down to the
 * narrowest phone, and a note on how the account page signs people in.
 * No "create account" button: the account page creates the account.
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

export interface SignInCardProps {
	readonly brand: ShellBrand;
	readonly locale: ShellLocale;
	readonly signInHref: string;
	/** App copy, e.g. "Sign in to Scribe". */
	readonly title: ReactNode;
	/** App copy under the title. */
	readonly description?: ReactNode;
	/** 1 (default) on its own page; 2 beside a Hero, whose title is the h1. */
	readonly headingLevel?: 1 | 2 | undefined;
	/** Opens sign-in instead of following the link (system browser in a native shell). */
	readonly onSignIn?: ((href: string) => void) | undefined;
	readonly linkComponent?: ShellLinkComponent | undefined;
	/** After the note, e.g. an error from the last sign-in. */
	readonly children?: ReactNode;
}

export function SignInCard(props: SignInCardProps): ReactNode {
	const { brand, signInHref } = props;
	const t = SHELL_MESSAGES[props.locale];
	const Heading = props.headingLevel === 2 ? "h2" : "h1";
	return (
		<section className="shell-card shell-sign-in-card" data-id="sign-in-card">
			<div className="shell-sign-in-head">
				<Heading className="shell-card-title">{props.title}</Heading>
				{props.description === undefined ? null : (
					<p className="shell-card-sub">{props.description}</p>
				)}
			</div>
			<ShellAnchor
				href={signInHref}
				className="shell-btn shell-btn-primary shell-btn-cta"
				data-id="sign-in-cta"
				onClick={handOver(signInHref, props.onSignIn)}
				linkComponent={props.linkComponent}
			>
				{t.signInWith(brand.domain)}
			</ShellAnchor>
			<p className="shell-card-note">{t.signInNote(brand.domain)}</p>
			{props.children}
		</section>
	);
}
