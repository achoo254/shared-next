/** The inlined marks are exactly the WebP files in assets/marks/. */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_SWITCHER_CATALOG } from "../src/catalog.js";
import { APP_MARKS } from "../src/marks.js";

describe("APP_MARKS", () => {
	it.each(APP_SWITCHER_CATALOG.map((entry) => entry.id))("%s", (id) => {
		const file = readFileSync(
			new URL(`../assets/marks/${id}-mark-64.webp`, import.meta.url),
		);
		expect(APP_MARKS[id]).toBe(
			`data:image/webp;base64,${file.toString("base64")}`,
		);
	});
});
