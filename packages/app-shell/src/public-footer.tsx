/**
 * Under every signed-out page, in the same place on every app: the
 * language pill and the theme switch, then one quiet row of links ("An
 * app from <domain>", privacy, terms, then the app's own links and
 * buttons), then the app's note if it has one.
 */
import type { ReactNode } from "react";
import { LanguageSwitch, type LanguageSwitchMode } from "./language-switch.js";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import {
	type ShellAction,
	ShellAnchor,
	type ShellBrand,
	type ShellLink,
	type ShellLinkComponent,
} from "./shell-link.js";
import { ThemeSwitch } from "./theme-switch.js";

export type PublicFooterProps<L extends ShellLocale = ShellLocale> =
	LanguageSwitchMode<L> & {
		readonly brand: ShellBrand;
		readonly locale: L;
		/** "/privacy" by default. */
		readonly privacyHref?: string | undefined;
		/** "/terms" by default; null for an app without terms of its own (no link). */
		readonly termsHref?: string | null | undefined;
		/**
		 * After the shared links: links (Docs, Delete account) and buttons
		 * (`{ label, dataId, onClick }`, e.g. Feedback opening a form).
		 */
		readonly footerLinks?: readonly (ShellLink | ShellAction)[] | undefined;
		/** A short line of the app under the links, e.g. "For entertainment". */
		readonly footerNote?: ReactNode;
		/**
		 * The header's links (PublicPage passes them): with `hideNavOnPhones`
		 * they are repeated here on phones, where the header hides them.
		 */
		readonly navLinks?: readonly ShellLink[] | undefined;
		readonly hideNavOnPhones?: boolean | undefined;
		/** The app's localStorage key of the theme before the shared cookie. */
		readonly legacyThemeKey?: string | undefined;
		readonly linkComponent?: ShellLinkComponent | undefined;
		/** The app's languages in switch order; vi and en by default. */
		readonly locales?: readonly L[] | undefined;
	};

function isAction(item: ShellLink | ShellAction): item is ShellAction {
	return item.href === undefined;
}

export function PublicFooter<L extends ShellLocale = ShellLocale>(
	props: PublicFooterProps<L>,
): ReactNode {
	const { brand, locale, linkComponent } = props;
	const t = SHELL_MESSAGES[locale];
	const items: readonly (ShellLink | ShellAction)[] = [
		{
			href: props.privacyHref ?? "/privacy",
			label: t.privacy,
			dataId: "foot-privacy",
		},
		...(props.termsHref === null
			? []
			: [
					{
						href: props.termsHref ?? "/terms",
						label: t.terms,
						dataId: "foot-terms",
					},
				]),
		...(props.footerLinks ?? []),
	];
	// The header's links, on phones only, unless the footer has the place already.
	const hrefs = new Set(items.map((item) => item.href));
	const phoneLinks =
		props.hideNavOnPhones === true
			? (props.navLinks ?? []).filter((link) => !hrefs.has(link.href))
			: [];
	const language: LanguageSwitchMode<L> = props.languageHref
		? { languageHref: props.languageHref }
		: { onLocaleChange: props.onLocaleChange };
	const hasNote = props.footerNote !== undefined && props.footerNote !== null;
	return (
		<footer className="shell-foot shell-container" data-id="public-footer">
			<div className="shell-foot-switches">
				<LanguageSwitch<L>
					{...language}
					locale={locale}
					locales={props.locales}
					domain={brand.domain}
				/>
				<ThemeSwitch
					locale={locale}
					domain={brand.domain}
					legacyThemeKey={props.legacyThemeKey}
				/>
			</div>
			<nav className="shell-foot-links" aria-label={t.footLinks}>
				<a
					className="shell-foot-link"
					href={`https://${brand.domain}`}
					data-id="foot-home"
				>
					{t.ecosystem(brand.domain)}
				</a>
				{phoneLinks.map((link) => (
					<ShellAnchor
						key={`nav-${link.dataId}`}
						href={link.href}
						className="shell-foot-link shell-only-phone"
						data-id={`foot-${link.dataId}`}
						aria-current={link.current === true ? "page" : undefined}
						linkComponent={linkComponent}
					>
						{link.label}
					</ShellAnchor>
				))}
				{items.map((item) =>
					isAction(item) ? (
						<button
							key={item.dataId}
							type="button"
							className="shell-foot-link"
							data-id={item.dataId}
							onClick={item.onClick}
						>
							{item.label}
						</button>
					) : (
						<ShellAnchor
							key={item.dataId}
							href={item.href}
							className="shell-foot-link"
							data-id={item.dataId}
							aria-current={item.current === true ? "page" : undefined}
							linkComponent={linkComponent}
						>
							{item.label}
						</ShellAnchor>
					),
				)}
			</nav>
			{hasNote ? (
				<p className="shell-foot-note" data-id="foot-note">
					{props.footerNote}
				</p>
			) : null}
		</footer>
	);
}
