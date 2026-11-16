/**
 * The 9-dot button and its popover of links to the other apps: a
 * non-modal <dialog> shown with the `open` attribute (never showModal, so
 * the page stays usable and the popover sits next to its button).
 * No inline styles (Scribe's CSP has no style-src 'unsafe-inline'): classes
 * come from app-switcher.css, themed by CSS variables. The only request is
 * the app's own chunk of app marks, loaded when the button is hovered,
 * focused or opened.
 */
import {
	Fragment,
	type MouseEvent,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import type {
	AppSwitcherGroup,
	AppSwitcherLocale,
	LocalizedText,
} from "./catalog.js";
import { crossSellSuggestion } from "./cross-sell.js";
import { EntryIcon, GridIcon } from "./icons.js";
import {
	type AppSwitcherLink,
	type AppSwitcherLinksOptions,
	appSwitcherLinks,
	resolveAppSwitcherLocale,
} from "./links.js";
import { loadAppMarks } from "./mark-loader.js";
import {
	readHiddenSuggestion,
	storeHiddenSuggestion,
} from "./suggestion-dismissal.js";
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

/** Heading above the first app of each group. */
const GROUP_HEADING: Readonly<Record<AppSwitcherGroup, LocalizedText>> = {
	tools: { en: "Tools", vi: "Công cụ", "zh-CN": "工具" },
	fun: { en: "Entertainment", vi: "Giải trí", "zh-CN": "娱乐" },
	learn: { en: "Learning", vi: "Học tập", "zh-CN": "学习" },
};

const PANEL_LABEL: LocalizedText = {
	en: "Apps",
	vi: "Ứng dụng",
	"zh-CN": "应用",
};

/** Badge of the app suggested for this one (cross-sell.ts). */
const SUGGESTED_BADGE: LocalizedText = {
	en: "Suggested",
	vi: "Gợi ý",
	"zh-CN": "推荐",
};

/** Name of the small button that hides the badge, before the app's name. */
const HIDE_SUGGESTION: LocalizedText = {
	en: "Hide suggestion",
	vi: "Ẩn gợi ý",
	"zh-CN": "隐藏推荐",
};

type LinksResult =
	| { readonly links: AppSwitcherLink[]; readonly error?: undefined }
	| { readonly links: []; readonly error: unknown };

/** Fetches the marks chunk; a failure only leaves the placeholders. */
function prefetchMarks(): void {
	loadAppMarks().catch((error: unknown) => console.error(error));
}

function safeLinks(options: AppSwitcherLinksOptions): LinksResult {
	try {
		return { links: appSwitcherLinks(options) };
	} catch (error) {
		return { links: [], error };
	}
}

export function AppSwitcher(props: AppSwitcherProps) {
	const { current, domain, onOpen } = props;
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
	const [hiddenSuggestion, setHiddenSuggestion] =
		useState(readHiddenSuggestion);
	const suggest = hiddenSuggestion !== crossSellSuggestion(current);

	const { links, error } = useMemo(
		() => safeLinks({ current, domain, locale, suggest }),
		[current, domain, locale, suggest],
	);
	useEffect(() => {
		// A wrong domain hides the switcher; the app keeps working.
		if (error !== undefined) console.error(error);
	}, [error]);
	useEffect(() => {
		if (open) prefetchMarks();
	}, [open]);
	if (links.length === 0) return null;

	function follow(event: MouseEvent<HTMLAnchorElement>, href: string): void {
		setOpen(false);
		if (!onOpen) return;
		event.preventDefault();
		// The page stays: focus goes back to the button, as on Esc.
		trigger.current?.focus();
		onOpen(href);
	}

	/** Hides the badge for good; focus moves to the app's link, which stays. */
	function hideSuggestion(
		event: MouseEvent<HTMLButtonElement>,
		id: string,
	): void {
		event.currentTarget.parentElement?.querySelector("a")?.focus();
		storeHiddenSuggestion(id);
		setHiddenSuggestion(id);
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
				onPointerEnter={prefetchMarks}
				onFocus={prefetchMarks}
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
					{links.map((link, index) => (
						<Fragment key={link.id}>
							{link.group && link.group !== links[index - 1]?.group ? (
								<li className="sn-app-switcher__heading" role="presentation">
									{GROUP_HEADING[link.group][locale]}
								</li>
							) : null}
							<li data-entry={link.id}>
								<a
									className="sn-app-switcher__link"
									href={link.href}
									target={newContext ? "_blank" : undefined}
									rel={newContext ? "noopener" : undefined}
									data-suggested={link.suggested ? "" : undefined}
									onClick={(event) => follow(event, link.href)}
								>
									<EntryIcon id={link.id} />
									<span className="sn-app-switcher__text">
										<span className="sn-app-switcher__label">
											{link.label}
											{link.suggested ? (
												<span className="sn-app-switcher__badge">
													{SUGGESTED_BADGE[locale]}
												</span>
											) : null}
										</span>
										<span className="sn-app-switcher__description">
											{link.description}
										</span>
									</span>
								</a>
								{link.suggested ? (
									<button
										type="button"
										className="sn-app-switcher__hide"
										aria-label={`${HIDE_SUGGESTION[locale]}: ${link.label}`}
										title={HIDE_SUGGESTION[locale]}
										onClick={(event) => hideSuggestion(event, link.id)}
									>
										<span aria-hidden="true">×</span>
									</button>
								) : null}
							</li>
						</Fragment>
					))}
				</ul>
			</dialog>
		</div>
	);
}
