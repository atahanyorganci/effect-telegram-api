import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { loadMethodErrors } from "./codegen/load-errors.ts";
import { loadMethods, loadObjects } from "./codegen/load-spec.ts";
import { renderErrorsModule } from "./codegen/render-errors.ts";
import { renderIndexModule } from "./codegen/render-index.ts";
import { renderMethodsModule } from "./codegen/render-methods.ts";
import { renderObjectsModule } from "./codegen/render-objects.ts";
import { renderTelegramClientModule } from "./codegen/render-telegram-client.ts";
import { renderTelegramModule } from "./codegen/render-telegram.ts";
import { collectRefs, INPUT_FILE_TYPE } from "./codegen/render-type-expr.ts";
import { BOTS_API_DOCUMENT } from "./document.ts";

const SRC_DIR = "src";
const OBJECTS_PATH = `${SRC_DIR}/Objects.ts`;
const METHODS_PATH = `${SRC_DIR}/Methods.ts`;
const ERRORS_PATH = `${SRC_DIR}/Errors.ts`;
const TELEGRAM_CLIENT_PATH = `${SRC_DIR}/TelegramClient.ts`;
const TELEGRAM_PATH = `${SRC_DIR}/Telegram.ts`;
const INDEX_PATH = `${SRC_DIR}/index.ts`;

const program = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;

	const objects = yield* loadObjects(BOTS_API_DOCUMENT.specDir);
	const methods = yield* loadMethods(BOTS_API_DOCUMENT.specDir);
	const methodErrors = yield* loadMethodErrors();

	const methodRefs = new Set<string>();
	for (const method of methods) {
		for (const parameter of method.parameters) {
			collectRefs(parameter.type, methodRefs);
		}
		collectRefs(method.returns, methodRefs);
	}

	const methodNames = new Set(methods.map(method => method.name));
	const { source: objectsSource, placeholders } = renderObjectsModule(objects, methodRefs, methodNames);
	const knownNames = new Set([...objects.map(object => object.name), INPUT_FILE_TYPE]);
	const methodsSource = renderMethodsModule(methods, methodErrors);
	const errorsSource = renderErrorsModule([...methodErrors.values()]);
	const telegramClientSource = renderTelegramClientModule(methods, methodErrors, knownNames);
	const telegramSource = renderTelegramModule(methods, methodErrors);
	const indexSource = renderIndexModule(methodErrors.size > 0);

	yield* fs.makeDirectory(SRC_DIR, { recursive: true });
	yield* fs.writeFileString(OBJECTS_PATH, objectsSource);
	yield* fs.writeFileString(METHODS_PATH, methodsSource);
	yield* fs.writeFileString(ERRORS_PATH, errorsSource);
	yield* fs.writeFileString(TELEGRAM_CLIENT_PATH, telegramClientSource);
	yield* fs.writeFileString(TELEGRAM_PATH, telegramSource);
	yield* fs.writeFileString(INDEX_PATH, indexSource);

	yield* Console.log(`Wrote ${objects.length} object schemas to ${OBJECTS_PATH}`);
	yield* Console.log(`Wrote ${methods.length} HTTP API endpoints to ${METHODS_PATH}`);
	yield* Console.log(`Wrote ${methodErrors.size} method error doc(s) to ${ERRORS_PATH}`);
	yield* Console.log(`Wrote TelegramClient service to ${TELEGRAM_CLIENT_PATH}`);
	yield* Console.log(`Wrote Telegram layer to ${TELEGRAM_PATH}`);
	yield* Console.log(`Wrote package exports to ${INDEX_PATH}`);
	if (placeholders.length > 0) {
		yield* Console.log(`Emitted ${placeholders.length} placeholder schemas (unions): ${placeholders.join(", ")}`);
	}
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
