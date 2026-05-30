import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { loadMethods, loadObjects } from "./codegen/load-spec.ts";
import { renderMethodsModule } from "./codegen/render-methods.ts";
import { renderObjectsModule } from "./codegen/render-objects.ts";
import { collectRefs } from "./codegen/render-type-expr.ts";
import { BOTS_API_DOCUMENT } from "./document.ts";

const SRC_DIR = "src";
const OBJECTS_PATH = `${SRC_DIR}/objects.ts`;
const METHODS_PATH = `${SRC_DIR}/methods.ts`;

const program = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;

	const objects = yield* loadObjects(BOTS_API_DOCUMENT.specDir);
	const methods = yield* loadMethods(BOTS_API_DOCUMENT.specDir);

	const methodRefs = new Set<string>();
	for (const method of methods) {
		for (const parameter of method.parameters) {
			collectRefs(parameter.type, methodRefs);
		}
		collectRefs(method.returns, methodRefs);
	}

	const { source: objectsSource, placeholders } = renderObjectsModule(objects, methodRefs);
	const methodsSource = renderMethodsModule(methods);

	yield* fs.makeDirectory(SRC_DIR, { recursive: true });
	yield* fs.writeFileString(OBJECTS_PATH, objectsSource);
	yield* fs.writeFileString(METHODS_PATH, methodsSource);

	yield* Console.log(`Wrote ${objects.length} object schemas to ${OBJECTS_PATH}`);
	yield* Console.log(`Wrote ${methods.length} RPC definitions to ${METHODS_PATH}`);
	if (placeholders.length > 0) {
		yield* Console.log(`Emitted ${placeholders.length} placeholder schemas (unions): ${placeholders.join(", ")}`);
	}
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
