import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { loadMethodErrors } from "../codegen/load-errors.ts";
import { loadMethods } from "../codegen/load-spec.ts";
import { BOTS_API_DOCUMENT } from "../document.ts";

const TEMPLATE_PATH = "scripts/readme/README.md";
const OUTPUT_PATH = "README.md";
const COVERAGE_MARKER = "<!-- COVERAGE.md -->";
const TEST_DIR = "test";

const yes = "✅";
const no = "❌";

const program = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const methods = (yield* loadMethods(BOTS_API_DOCUMENT.specDir)).map(method => method.name).sort();
	const methodErrors = yield* loadMethodErrors();

	const testEntries = yield* fs.readDirectory(TEST_DIR);
	const tested = new Set(
		testEntries.filter(entry => entry.endsWith(".test.ts")).map(entry => entry.slice(0, -".test.ts".length)),
	);

	const rows = methods.map(method => ({
		method,
		test: tested.has(method) ? yes : no,
		errors: methodErrors.has(method) ? yes : no,
	}));

	const table = [
		"| Method | Test | Documented errors |",
		"|--------|------|-------------------|",
		...rows.map(row => `| \`${row.method}\` | ${row.test} | ${row.errors} |`),
	].join("\n");

	const template = yield* fs.readFileString(TEMPLATE_PATH);
	if (!template.includes(COVERAGE_MARKER)) {
		return yield* Effect.dieMessage(`${TEMPLATE_PATH} must contain ${COVERAGE_MARKER}`);
	}

	const readme = template.replace(COVERAGE_MARKER, table);
	yield* fs.writeFileString(OUTPUT_PATH, readme.endsWith("\n") ? readme : `${readme}\n`);
	yield* Console.log(`Wrote ${OUTPUT_PATH} (${rows.length} methods)`);
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
