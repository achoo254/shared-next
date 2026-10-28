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
export declare function FeatureList(props: FeatureListProps): ReactNode;
