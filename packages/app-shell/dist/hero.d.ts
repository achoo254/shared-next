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
export declare function Hero(props: HeroProps): ReactNode;
