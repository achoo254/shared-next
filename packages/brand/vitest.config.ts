import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@achoo254/brand",
		include: ["test/**/*.test.ts"],
	},
});
