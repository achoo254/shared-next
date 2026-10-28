import { jsx as _jsx } from "react/jsx-runtime";
/** A path of this app ("/login"), not another origin ("//x", "https:"). */
function isAppPath(href) {
    return href.startsWith("/") && !href.startsWith("//");
}
export function ShellAnchor({ linkComponent: Link, ...props }) {
    if (Link && isAppPath(props.href))
        return _jsx(Link, { ...props });
    return _jsx("a", { ...props });
}
/** Joins class names, skipping empty ones. */
export function classes(...names) {
    return names.filter(Boolean).join(" ");
}
/**
 * Click handler that hands the URL to `open` instead of following it (a
 * native shell opens sign-in in the system browser); none without `open`.
 */
export function handOver(href, open) {
    if (!open)
        return undefined;
    return (event) => {
        event.preventDefault();
        open(href);
    };
}
