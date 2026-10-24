import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@shared-next/app-shorts",
		include: ["test/**/*.test.ts"],
	},
});
