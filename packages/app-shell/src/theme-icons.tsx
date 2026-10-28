/**
 * Sun, moon and screen of the theme switch: inline outline SVG in
 * currentColor (the Tabler shapes the apps used), decorative because each
 * button has its own accessible name.
 */
import type { ReactNode } from "react";
import type { ThemePreference } from "./preferences.js";

const PATHS: Readonly<Record<ThemePreference, readonly string[]>> = {
	light: [
		"M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
		"M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7",
	],
	dark: [
		"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z",
	],
	system: [
		"M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z",
		"M7 20h10",
		"M9 16v4",
		"M15 16v4",
	],
};

export function ThemeIcon({
	theme,
}: {
	readonly theme: ThemePreference;
}): ReactNode {
	return (
		<svg
			className="shell-icon"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{PATHS[theme].map((d) => (
				<path key={d} d={d} />
			))}
		</svg>
	);
}
