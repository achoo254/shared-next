import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@achoo254/app-switcher",
		include: ["test/**/*.test.{ts,tsx}"],
	},
});
