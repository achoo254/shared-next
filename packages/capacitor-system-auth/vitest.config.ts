import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@achoo254/capacitor-system-auth",
		include: ["test/**/*.test.ts"],
	},
});
