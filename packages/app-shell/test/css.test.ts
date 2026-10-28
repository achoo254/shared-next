/**
 * The stylesheets' rules that a reader cannot see break: the two dark
 * blocks of tokens.css stay identical (localman's check:tokens rule), and
 * app-shell.css takes every colour from tokens and only styles shell-
 * classes, so it can sit next to an app's own CSS or Tailwind.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string): string =>
	readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

/** Declarations inside the first `{ … }` after `marker`, sorted. */
function declarationsAfter(css: string, marker: string): string[] {
	const start = css.indexOf("{", css.indexOf(marker) + marker.length);
	const end = css.indexOf("}", start);
	return css
		.slice(start + 1, end)
		.split(";")
		.map((line) => line.replace(/\/\*.*?\*\//g, "").trim())
		.filter(Boolean)
		.sort();
}

describe("tokens.css", () => {
	const css = read("tokens.css");

	it("keeps OS dark and forced dark identical", () => {
		const osDark = declarationsAfter(css, ':root:not([data-theme="light"])');
		const forcedDark = declarationsAfter(css, ':root[data-theme="dark"]');
		expect(osDark.length).toBeGreaterThan(40);
		expect(osDark).toEqual(forcedDark);
	});

	it("defines every variable app-shell.css reads", () => {
		const used = new Set(read("app-shell.css").match(/var\(--[\w-]+/g));
		const missing = [...used]
			.map((use) => use.slice(4))
			.filter((name) => !css.includes(`${name}:`));
		expect(missing).toEqual([]);
	});
});

describe("app-shell.css", () => {
	const css = read("app-shell.css").replace(/\/\*[\s\S]*?\*\//g, "");

	it("has no colour literals", () => {
		expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
		expect(css).not.toMatch(/\b(?:rgb|rgba|hsl|hsla|oklch)\(/i);
	});

	it("only styles shell- classes", () => {
		const selectors = css
			.replace(/@media[^{]*\{/g, "")
			.split("}")
			.map((block) => block.split("{")[0]?.trim() ?? "")
			.filter(Boolean)
			.flatMap((list) => list.split(",").map((s) => s.trim()));
		expect(selectors.length).toBeGreaterThan(50);
		for (const selector of selectors) {
			expect(selector, selector).toMatch(/^\.shell(?:-[\w-]+)?\b/);
		}
	});
});
