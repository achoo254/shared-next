import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@shared-next/app-switcher",
		include: ["test/**/*.test.{ts,tsx}"],
	},
});
