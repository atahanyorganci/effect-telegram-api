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
const METHODS_PATH = "src/Methods.ts";
const TEST_DIR = "test";
const ERRORS_DIR = "errors";

const yes = "✅";
const no = "❌";

const indexMethodLines = (source: string): Map<string, number> => {
	const lines = new Map<string, number>();
	for (const [index, line] of source.split("\n").entries()) {
		const match = line.match(/^export const (\w+) = Rpc\.make\(/);
		if (match !== null) {
			lines.set(match[1]!, index + 1);
		}
	}
	return lines;
};

const indexTestLine = (source: string, method: string): number => {
	for (const [index, line] of source.split("\n").entries()) {
		if (line.includes(`describe("${method}"`)) {
			return index + 1;
		}
	}
	return 1;
};

const indexErrorDocLine = (source: string): number => {
	for (const [index, line] of source.split("\n").entries()) {
		if (line.includes('"method":')) {
			return index + 1;
		}
	}
	return 1;
};

const link = (label: string, path: string, line: number): string => `[${label}](${path}#L${line})`;

const program = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const methods = (yield* loadMethods(BOTS_API_DOCUMENT.specDir)).map(method => method.name).sort();
	const methodErrors = yield* loadMethodErrors();

	const methodsSource = yield* fs.readFileString(METHODS_PATH);
	const methodLines = indexMethodLines(methodsSource);

	const testEntries = yield* fs.readDirectory(TEST_DIR);
	const tested = new Set(
		testEntries.filter(entry => entry.endsWith(".test.ts")).map(entry => entry.slice(0, -".test.ts".length)),
	);

	const testLines = new Map<string, number>();
	for (const entry of testEntries.filter(name => name.endsWith(".test.ts"))) {
		const method = entry.slice(0, -".test.ts".length);
		const source = yield* fs.readFileString(`${TEST_DIR}/${entry}`);
		testLines.set(method, indexTestLine(source, method));
	}

	const errorLines = new Map<string, number>();
	for (const method of methodErrors.keys()) {
		const source = yield* fs.readFileString(`${ERRORS_DIR}/${method}.json`);
		errorLines.set(method, indexErrorDocLine(source));
	}

	const rows = methods.map(method => {
		const methodLine = methodLines.get(method);
		const methodCell =
			methodLine === undefined ? `\`${method}\`` : link(`\`${method}\``, `./${METHODS_PATH}`, methodLine);

		const testCell = tested.has(method) ? link(yes, `./${TEST_DIR}/${method}.test.ts`, testLines.get(method) ?? 1) : no;

		const errorsCell = methodErrors.has(method)
			? link(yes, `./${ERRORS_DIR}/${method}.json`, errorLines.get(method) ?? 1)
			: no;

		return `| ${methodCell} | ${testCell} | ${errorsCell} |`;
	});

	const table = ["| Method | Test | Documented errors |", "|--------|------|-------------------|", ...rows].join("\n");

	const template = yield* fs.readFileString(TEMPLATE_PATH);
	if (!template.includes(COVERAGE_MARKER)) {
		return yield* Effect.die(`${TEMPLATE_PATH} must contain ${COVERAGE_MARKER}`);
	}

	const readme = template.replace(COVERAGE_MARKER, table);
	yield* fs.writeFileString(OUTPUT_PATH, readme.endsWith("\n") ? readme : `${readme}\n`);
	yield* Console.log(`Wrote ${OUTPUT_PATH} (${methods.length} methods)`);
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
