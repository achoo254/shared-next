import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Hero(props) {
    const hasAside = props.aside !== undefined && props.aside !== null;
    return (_jsxs("section", { className: hasAside ? "shell-hero shell-hero-split" : "shell-hero", "data-id": "hero", children: [_jsxs("div", { className: "shell-hero-intro", children: [props.eyebrow === undefined ? null : (_jsx("p", { className: "shell-eyebrow", children: props.eyebrow })), _jsx("h1", { className: "shell-hero-title", children: props.title }), props.lede === undefined ? null : (_jsx("p", { className: "shell-lede", children: props.lede })), props.children] }), hasAside ? _jsx("div", { className: "shell-hero-aside", children: props.aside }) : null] }));
}
