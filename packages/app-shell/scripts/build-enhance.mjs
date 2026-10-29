/**
 * Bundles src/app-shell-enhance.ts and what it imports into
 * dist/app-shell-enhance.js: one classic script (IIFE) with no imports, so
 * a server-rendered page serves it as a `script-src 'self'` file.
 */
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));

await build({
	entryPoints: ["src/app-shell-enhance.ts"],
	outfile: "dist/app-shell-enhance.js",
	bundle: true,
	format: "iife",
	platform: "browser",
	target: "es2020",
	charset: "utf8",
	legalComments: "none",
	banner: {
		js: `/* @achoo254/app-shell ${version} app-shell-enhance.js: theme switch and account menu of server-rendered pages (README, "Trang dựng trên server"). MIT. */`,
	},
	logLevel: "warning",
});
