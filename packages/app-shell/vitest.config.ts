import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@achoo254/app-shell",
		include: ["test/**/*.test.{ts,tsx}"],
	},
});
