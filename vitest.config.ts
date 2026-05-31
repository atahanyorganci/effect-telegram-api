import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Load before test collection so `skipIf` and workers see env vars.
config({ path: resolve(fileURLToPath(new URL(".", import.meta.url)), ".env"), quiet: true });

export default defineConfig({
	test: {
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
		globalSetup: ["./test/globalSetup.ts"],
		include: ["test/**/*.test.ts"],
		testTimeout: 30_000,
	},
});
