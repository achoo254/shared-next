import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@shared-next/capacitor-system-auth",
		include: ["test/**/*.test.ts"],
	},
});
