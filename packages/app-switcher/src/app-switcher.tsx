/**
 * The 9-dot button and its popover of links to the tenant's other apps: a
 * non-modal <dialog> shown with the `open` attribute (never showModal, so
 * the page stays usable and the popover sits next to its button).
 * No inline styles (Scribe's CSP has no style-src 'unsafe-inline'), no
 * network: classes come from app-switcher.css, themed by CSS variables.
 */
import {
	type MouseEvent,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import type { AppSwitcherLocale, LocalizedText } from "./catalog.js";
import { EntryIcon, GridIcon } from "./icons.js";
import {
	type AppSwitcherLink,
	type AppSwitcherLinksOptions,
	appSwitcherLinks,
	resolveAppSwitcherLocale,
} from "./links.js";
import { usePopoverDismiss } from "./use-popover-dismiss.js";
import { useStandaloneDisplay } from "./use-standalone-display.js";

/** Where the panel opens: under a header button, or beside a side rail. */
export type AppSwitcherPlacement = "bottom-end" | "right-end";

export interface AppSwitcherProps extends AppSwitcherLinksOptions {
	/**
	 * Opens a link instead of the browser following it, e.g. in the system
	 * browser from a native shell. Without it the link is a plain `<a href>`,
	 * opened in a new browsing context when the page runs as an installed PWA.
	 */
	readonly onOpen?: ((url: string) => void) | undefined;
	readonly placement?: AppSwitcherPlacement | undefined;
	/** Extra class on the root, for the app's own layout. */
	readonly className?: string | undefined;
}

const BUTTON_LABEL: LocalizedText = {
	en: "Switch app",
	vi: "Chuyển ứng dụng",
	"zh-CN": "切换应用",
};

const PANEL_LABEL: LocalizedText = {
	en: "Apps",
	vi: "Ứng dụng",
	"zh-CN": "应用",
};

type LinksResult =
	| { readonly links: AppSwitcherLink[]; readonly error?: undefined }
	| { readonly links: []; readonly error: unknown };

function safeLinks(options: AppSwitcherLinksOptions): LinksResult {
	try {
		return { links: appSwitcherLinks(options) };
	} catch (error) {
		return { links: [], error };
	}
}

export function AppSwitcher(props: AppSwitcherProps) {
	const { current, tenantDomain, isPrimaryTenant, onOpen } = props;
	const locale: AppSwitcherLocale = resolveAppSwitcherLocale(props.locale);
	const panelId = useId();
	const [open, setOpen] = useState(false);
	const root = useRef<HTMLDivElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const panel = useRef<HTMLDialogElement>(null);
	const close = useCallback(() => setOpen(false), []);
	const refs = useMemo(() => ({ root, trigger, panel }), []);
	usePopoverDismiss(open, close, refs);
	// An installed PWA would load the other app in its own window.
	const newContext = useStandaloneDisplay() && !onOpen;

	const { links, error } = useMemo(
		() => safeLinks({ current, tenantDomain, isPrimaryTenant, locale }),
		[current, tenantDomain, isPrimaryTenant, locale],
	);
	useEffect(() => {
		// A wrong tenant domain hides the switcher; the app keeps working.
		if (error !== undefined) console.error(error);
	}, [error]);
	if (links.length === 0) return null;

	function follow(event: MouseEvent<HTMLAnchorElement>, href: string): void {
		setOpen(false);
		if (!onOpen) return;
		event.preventDefault();
		// The page stays: focus goes back to the button, as on Esc.
		trigger.current?.focus();
		onOpen(href);
	}

	const rootClass = ["sn-app-switcher", props.className]
		.filter(Boolean)
		.join(" ");
	return (
		<div
			ref={root}
			className={rootClass}
			data-placement={props.placement ?? "bottom-end"}
		>
			<button
				ref={trigger}
				type="button"
				className="sn-app-switcher__button"
				aria-label={BUTTON_LABEL[locale]}
				title={BUTTON_LABEL[locale]}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={panelId}
				onClick={() => setOpen((value) => !value)}
			>
				<GridIcon />
			</button>
			<dialog
				ref={panel}
				id={panelId}
				aria-label={PANEL_LABEL[locale]}
				className="sn-app-switcher__panel"
				open={open}
			>
				<ul className="sn-app-switcher__list">
					{links.map((link) => (
						<li key={link.id} data-entry={link.id}>
							<a
								className="sn-app-switcher__link"
								href={link.href}
								target={newContext ? "_blank" : undefined}
								rel={newContext ? "noopener" : undefined}
								onClick={(event) => follow(event, link.href)}
							>
								<EntryIcon id={link.id} />
								<span className="sn-app-switcher__text">
									<span className="sn-app-switcher__label">{link.label}</span>
									<span className="sn-app-switcher__description">
										{link.description}
									</span>
								</span>
							</a>
						</li>
					))}
				</ul>
			</dialog>
		</div>
	);
}
