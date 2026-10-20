import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@shared-next/brand",
		include: ["test/**/*.test.ts"],
	},
});
