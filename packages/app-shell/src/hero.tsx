/**
 * Top of an app's welcome page: a small eyebrow, the page title (h1) and a
 * lede, with an optional block beside it on wide screens and under it on
 * phones (usually the SignInCard with headingLevel 2).
 */
import type { ReactNode } from "react";

export interface HeroProps {
	readonly title: ReactNode;
	readonly eyebrow?: ReactNode;
	readonly lede?: ReactNode;
	/** Under the lede, e.g. a short check list. */
	readonly children?: ReactNode;
	/** Beside the intro from 900px, under it below. */
	readonly aside?: ReactNode;
}

export function Hero(props: HeroProps): ReactNode {
	const hasAside = props.aside !== undefined && props.aside !== null;
	return (
		<section
			className={hasAside ? "shell-hero shell-hero-split" : "shell-hero"}
			data-id="hero"
		>
			<div className="shell-hero-intro">
				{props.eyebrow === undefined ? null : (
					<p className="shell-eyebrow">{props.eyebrow}</p>
				)}
				<h1 className="shell-hero-title">{props.title}</h1>
				{props.lede === undefined ? null : (
					<p className="shell-lede">{props.lede}</p>
				)}
				{props.children}
			</div>
			{hasAside ? <div className="shell-hero-aside">{props.aside}</div> : null}
		</section>
	);
}
