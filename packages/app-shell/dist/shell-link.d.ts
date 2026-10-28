/**
 * Content types every shell component shares, and the one anchor they all
 * render: the app's router link for its own paths, a plain `<a>` otherwise.
 */
import type { ComponentType, MouseEvent, ReactNode } from "react";
/** What the shell shows of the app; `@achoo254/brand` gives each field. */
export interface ShellBrand {
    /** `appName` of brand.config.json, shown bold next to the mark. */
    readonly appName: string;
    /** `primaryTenant.domain`: the ecosystem's root domain, e.g. hoandat.com. */
    readonly domain: string;
    /** URL of the app's AI mark (bundled asset or data URI), drawn at 24px. */
    readonly markSrc: string;
}
/** A header or footer link the app adds. */
export interface ShellLink {
    readonly href: string;
    readonly label: string;
    /** `data-id` of the link, e.g. "topbar-docs". */
    readonly dataId: string;
    /** Marks the link as the current page. */
    readonly current?: boolean | undefined;
    /** Header only: hidden on phones (< 480px), where room is short. */
    readonly hideOnPhones?: boolean | undefined;
}
/**
 * A footer item that does something on the page instead of going
 * somewhere (Feedback opening a form): a button styled as the links.
 */
export interface ShellAction {
    readonly label: string;
    /** `data-id` of the button, e.g. "foot-feedback". */
    readonly dataId: string;
    /**
     * What the button does. A server-rendered page without React leaves it
     * out and wires the button by its `data-id` in its own script file.
     */
    readonly onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
    readonly href?: undefined;
}
/** Props the shell gives a router link component. */
export interface ShellAnchorProps {
    readonly href: string;
    readonly className: string;
    readonly children: ReactNode;
    readonly "data-id"?: string | undefined;
    readonly "aria-current"?: "page" | undefined;
    readonly "aria-busy"?: true | undefined;
    readonly "aria-disabled"?: true | undefined;
    readonly onClick?: ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}
/**
 * The app's link for its own paths, so they navigate without a reload,
 * e.g. `({ href, ...rest }) => <Link to={href} {...rest} />` for React
 * Router. It must render an `<a>` with every prop it gets.
 */
export type ShellLinkComponent = ComponentType<ShellAnchorProps>;
export declare function ShellAnchor({ linkComponent: Link, ...props }: ShellAnchorProps & {
    readonly linkComponent?: ShellLinkComponent | undefined;
}): ReactNode;
/** Joins class names, skipping empty ones. */
export declare function classes(...names: readonly (string | false | undefined)[]): string;
/**
 * Click handler that hands the URL to `open` instead of following it (a
 * native shell opens sign-in in the system browser); none without `open`.
 */
export declare function handOver(href: string, open: ((href: string) => void) | undefined): ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
