/**
 * What the app does, as a grid of short cards (one column on phones, up
 * to three on wide screens) under an optional eyebrow and heading.
 */
import type { ReactNode } from "react";

export interface FeatureItem {
	/** Stable key, used in `data-id="feature-<id>"`. */
	readonly id: string;
	readonly title: ReactNode;
	readonly description: ReactNode;
	/** Decorative icon before the title. */
	readonly icon?: ReactNode;
}

export interface FeatureListProps {
	readonly items: readonly FeatureItem[];
	readonly eyebrow?: ReactNode;
	readonly title?: ReactNode;
	/** `id` of the section, the target of a "#features" header link. */
	readonly id?: string | undefined;
}

export function FeatureList(props: FeatureListProps): ReactNode {
	return (
		<section className="shell-features" id={props.id} data-id="features">
			{props.eyebrow === undefined && props.title === undefined ? null : (
				<div className="shell-features-head">
					{props.eyebrow === undefined ? null : (
						<p className="shell-eyebrow">{props.eyebrow}</p>
					)}
					{props.title === undefined ? null : (
						<h2 className="shell-section-title">{props.title}</h2>
					)}
				</div>
			)}
			<ul className="shell-feature-grid">
				{props.items.map((item) => (
					<li
						key={item.id}
						className="shell-card shell-feature"
						data-id={`feature-${item.id}`}
					>
						<h3 className="shell-feature-title">
							{item.icon === undefined ? null : (
								<span className="shell-feature-icon" aria-hidden="true">
									{item.icon}
								</span>
							)}
							{item.title}
						</h3>
						<p className="shell-feature-text">{item.description}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
