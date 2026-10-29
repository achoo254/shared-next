/**
 * Avatar button and account menu of a signed-in user, as on Localman's top
 * bar: the IdP picture (or the first letter of the name) and the name, then
 * a menu with the name and email, the app's own entries, the IdP account
 * pages and sign-out. Goes in PublicHeader's `accountSlot` or the app's own
 * top bar.
 *
 * A `<details>` disclosure, so it opens with no script on a server-rendered
 * page; account-menu-behavior.ts closes it on an outside click, Escape,
 * tabbing away or a chosen item (wired here in React, by
 * app-shell-enhance.js on a page without React).
 */
import { type ReactNode, useEffect, useRef } from "react";
import { AccountIcon } from "./account-icons.js";
import { wireAccountMenu } from "./account-menu-behavior.js";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import {
	ShellAnchor,
	type ShellLinkComponent,
	handOver,
} from "./shell-link.js";

/** What the app knows of the signed-in user; any field may be missing. */
export interface ShellUser {
	/** Display name (or username) from the IdP. */
	readonly name?: string | null | undefined;
	readonly email?: string | null | undefined;
	/** IdP picture URL; only `https:` ones are shown. */
	readonly picture?: string | null | undefined;
}

/** An entry of the app: a link (`href`) or an action (`onClick`). */
export interface AccountMenuEntry {
	readonly label: string;
	/** `data-id` of the item, e.g. "account-menu-settings". */
	readonly dataId: string;
	readonly href?: string | undefined;
	readonly onClick?: (() => void) | undefined;
	/** A 16px decorative icon. */
	readonly icon?: ReactNode;
}

/**
 * How the app signs out: a POST form (server sessions with a CSRF field),
 * or a callback (an API call, a native shell).
 */
export type AccountSignOut =
	| {
			readonly action: string;
			/** Hidden fields of the form, e.g. the CSRF token. */
			readonly fields?: Readonly<Record<string, string>> | undefined;
	  }
	| {
			readonly onClick: () => void;
			/** Disables the item while signing out. */
			readonly busy?: boolean | undefined;
	  };

export interface AccountMenuProps {
	readonly user: ShellUser;
	readonly locale: ShellLocale;
	/** The brand's root domain (hoandat.com), named in the IdP heading. */
	readonly domain: string;
	/**
	 * The IdP account page ("https://auth.hoandat.com/account"), whose
	 * sections the menu links to in a new tab; `null` leaves the group out
	 * (on the IdP itself).
	 */
	readonly idpAccountUrl: string | null;
	/** The app's entries, one group per array, separated by a rule. */
	readonly entries?: readonly (readonly AccountMenuEntry[])[] | undefined;
	readonly signOut: AccountSignOut;
	/** Opens an IdP link instead of a new tab (system browser in a native shell). */
	readonly onOpenExternal?: ((href: string) => void) | undefined;
	readonly linkComponent?: ShellLinkComponent | undefined;
}

/** The IdP account sections Localman's menu links to. */
const IDP_SECTIONS = [
	{ id: "email", hash: "account-email", icon: "mail" },
	{ id: "sign-in", hash: "account-sign-in", icon: "user" },
] as const;

/** The name shown: display name, then email, then the word "Account". */
function shownName(user: ShellUser, fallback: string): string {
	return user.name?.trim() || user.email?.trim() || fallback;
}

function Avatar({
	name,
	picture,
}: {
	readonly name: string;
	readonly picture: string | null | undefined;
}): ReactNode {
	if (picture?.startsWith("https://")) {
		return (
			<img
				className="shell-avatar"
				src={picture}
				width={28}
				height={28}
				alt=""
				referrerPolicy="no-referrer"
			/>
		);
	}
	// Drawn by CSS so the letter is not part of the button's visible text
	// (axe label-content-name-mismatch).
	const initial = name.normalize("NFD").charAt(0).toUpperCase();
	return (
		<span
			className="shell-avatar shell-avatar-initial"
			data-initial={initial}
			aria-hidden="true"
		/>
	);
}

function EntryItem({
	entry,
	linkComponent,
}: {
	readonly entry: AccountMenuEntry;
	readonly linkComponent: ShellLinkComponent | undefined;
}): ReactNode {
	const content = (
		<>
			{entry.icon}
			<span className="shell-account-label">{entry.label}</span>
		</>
	);
	if (entry.href !== undefined) {
		return (
			<ShellAnchor
				href={entry.href}
				className="shell-account-item"
				data-id={entry.dataId}
				linkComponent={linkComponent}
				onClick={entry.onClick}
			>
				{content}
			</ShellAnchor>
		);
	}
	return (
		<button
			type="button"
			className="shell-account-item"
			data-id={entry.dataId}
			onClick={entry.onClick}
		>
			{content}
		</button>
	);
}

function SignOutItem({
	signOut,
	label,
}: {
	readonly signOut: AccountSignOut;
	readonly label: string;
}): ReactNode {
	const content = (
		<>
			<AccountIcon name="logout" />
			<span className="shell-account-label">{label}</span>
		</>
	);
	if ("action" in signOut) {
		return (
			<form
				className="shell-account-form"
				method="post"
				action={signOut.action}
			>
				{Object.entries(signOut.fields ?? {}).map(([name, value]) => (
					<input key={name} type="hidden" name={name} value={value} />
				))}
				<button
					type="submit"
					className="shell-account-item"
					data-id="account-menu-sign-out"
				>
					{content}
				</button>
			</form>
		);
	}
	return (
		<button
			type="button"
			className="shell-account-item"
			data-id="account-menu-sign-out"
			disabled={signOut.busy === true}
			aria-busy={signOut.busy === true ? true : undefined}
			onClick={signOut.onClick}
		>
			{content}
		</button>
	);
}

export function AccountMenu(props: AccountMenuProps): ReactNode {
	const { user, domain, idpAccountUrl, entries = [], linkComponent } = props;
	const t = SHELL_MESSAGES[props.locale];
	const name = shownName(user, t.account);
	const email = user.email?.trim();
	const menu = useRef<HTMLDetailsElement>(null);
	useEffect(() => {
		const element = menu.current;
		return element ? wireAccountMenu(element) : undefined;
	}, []);
	const groups = entries.filter((group) => group.length > 0);
	return (
		<details ref={menu} className="shell-account" data-id="account-menu">
			<summary
				className="shell-account-trigger"
				data-id="topbar-account"
				aria-label={t.accountTrigger(name)}
			>
				<Avatar name={name} picture={user.picture} />
				<span className="shell-account-name">{name}</span>
				<AccountIcon name="chevronDown" />
			</summary>
			<div className="shell-account-panel">
				<div className="shell-account-head">
					<span className="shell-account-head-name">{name}</span>
					{email && email !== name ? (
						<span className="shell-account-head-email">{email}</span>
					) : null}
				</div>
				{groups.map((group) => (
					<div key={group[0]?.dataId} className="shell-account-group">
						{group.map((entry) => (
							<EntryItem
								key={entry.dataId}
								entry={entry}
								linkComponent={linkComponent}
							/>
						))}
					</div>
				))}
				{idpAccountUrl !== null ? (
					<div className="shell-account-group">
						<span className="shell-account-heading">
							{t.idpHeading(domain)}
						</span>
						{IDP_SECTIONS.map((section) => {
							const href = `${idpAccountUrl}#${section.hash}`;
							return (
								<a
									key={section.id}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="shell-account-item"
									data-id={`account-menu-idp-${section.id}`}
									onClick={handOver(href, props.onOpenExternal)}
								>
									<AccountIcon name={section.icon} />
									<span className="shell-account-label">
										{section.id === "email" ? t.idpEmail : t.idpSignIn}
										<span className="shell-sr-only">{t.opensIdp(domain)}</span>
									</span>
									<AccountIcon name="externalLink" size={14} />
								</a>
							);
						})}
					</div>
				) : null}
				<div className="shell-account-group">
					<SignOutItem signOut={props.signOut} label={t.signOut} />
				</div>
			</div>
		</details>
	);
}
