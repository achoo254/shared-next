/**
 * Under every signed-out page, in the same place on every app: the
 * language pill and the theme switch, then one quiet row of links ("An
 * app from <domain>", privacy, terms, then the app's own).
 */
import type { ReactNode } from "react";
import { LanguageSwitch, type LanguageSwitchMode } from "./language-switch.js";
import type { ShellLocale } from "./locale.js";
import { SHELL_MESSAGES } from "./messages.js";
import {
	ShellAnchor,
	type ShellBrand,
	type ShellLink,
	type ShellLinkComponent,
} from "./shell-link.js";
import { ThemeSwitch } from "./theme-switch.js";

export type PublicFooterProps = LanguageSwitchMode & {
	readonly brand: ShellBrand;
	readonly locale: ShellLocale;
	/** "/privacy" by default. */
	readonly privacyHref?: string | undefined;
	/** "/terms" by default. */
	readonly termsHref?: string | undefined;
	/** After the shared links, e.g. Docs or Delete account. */
	readonly footerLinks?: readonly ShellLink[] | undefined;
	/** The app's localStorage key of the theme before the shared cookie. */
	readonly legacyThemeKey?: string | undefined;
	readonly linkComponent?: ShellLinkComponent | undefined;
	/** The app's languages in switch order; vi and en by default. */
	readonly locales?: readonly ShellLocale[] | undefined;
};

export function PublicFooter(props: PublicFooterProps): ReactNode {
	const { brand, locale, linkComponent } = props;
	const t = SHELL_MESSAGES[locale];
	const links: readonly ShellLink[] = [
		{
			href: props.privacyHref ?? "/privacy",
			label: t.privacy,
			dataId: "foot-privacy",
		},
		{ href: props.termsHref ?? "/terms", label: t.terms, dataId: "foot-terms" },
		...(props.footerLinks ?? []),
	];
	const language: LanguageSwitchMode = props.languageHref
		? { languageHref: props.languageHref }
		: { onLocaleChange: props.onLocaleChange };
	return (
		<footer className="shell-foot shell-container" data-id="public-footer">
			<div className="shell-foot-switches">
				<LanguageSwitch
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
				{links.map((link) => (
					<ShellAnchor
						key={link.dataId}
						href={link.href}
						className="shell-foot-link"
						data-id={link.dataId}
						aria-current={link.current === true ? "page" : undefined}
						linkComponent={linkComponent}
					>
						{link.label}
					</ShellAnchor>
				))}
			</nav>
		</footer>
	);
}
