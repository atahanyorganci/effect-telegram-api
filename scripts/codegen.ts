import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { loadMethodErrors } from "./codegen/load-errors.ts";
import { loadMethods, loadSpec } from "./codegen/load-spec.ts";
import { renderErrorsModule } from "./codegen/render-errors.ts";
import { renderMethodsModule } from "./codegen/render-methods.ts";
import { renderObjectsModule } from "./codegen/render-objects.ts";
import { renderTelegramClientModule } from "./codegen/render-telegram-client.ts";
import { renderTelegramModule } from "./codegen/render-telegram.ts";
import { collectRefs, INPUT_FILE_TYPE } from "./codegen/render-type-expr.ts";
import { BOTS_API_DOCUMENT } from "./document.ts";

const SRC_DIR = "src";
const SCHEMA_PATH = `${SRC_DIR}/schema.ts`;
const HTTP_API_PATH = `${SRC_DIR}/http-api.ts`;
const ERRORS_PATH = `${SRC_DIR}/errors.ts`;
const CLIENT_DIR = `${SRC_DIR}/client`;
const CLIENT_SERVICE_PATH = `${CLIENT_DIR}/service.ts`;
const CLIENT_LIVE_PATH = `${CLIENT_DIR}/live.ts`;

const program = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;

	const { objects, unions } = yield* loadSpec(BOTS_API_DOCUMENT.specDir);
	const methods = yield* loadMethods(BOTS_API_DOCUMENT.specDir);
	const methodErrors = yield* loadMethodErrors(BOTS_API_DOCUMENT.specDir);

	const methodRefs = new Set<string>();
	for (const method of methods) {
		for (const parameter of method.parameters) {
			collectRefs(parameter.type, methodRefs);
		}
		collectRefs(method.returns, methodRefs);
	}

	const methodNames = new Set(methods.map(method => method.name));
	const { source: objectsSource, placeholders } = renderObjectsModule(objects, unions, methodRefs, methodNames);
	const knownNames = new Set([
		...objects.map(object => object.name),
		...unions.map(union => union.name),
		INPUT_FILE_TYPE,
	]);
	const methodsSource = renderMethodsModule(methods, methodErrors);
	const errorsSource = renderErrorsModule();
	const telegramClientSource = renderTelegramClientModule(methods, methodErrors, knownNames);
	const telegramSource = renderTelegramModule(methods, methodErrors);

	yield* fs.makeDirectory(SRC_DIR, { recursive: true });
	yield* fs.makeDirectory(CLIENT_DIR, { recursive: true });
	yield* fs.writeFileString(SCHEMA_PATH, objectsSource);
	yield* fs.writeFileString(HTTP_API_PATH, methodsSource);
	yield* fs.writeFileString(ERRORS_PATH, errorsSource);
	yield* fs.writeFileString(CLIENT_SERVICE_PATH, telegramClientSource);
	yield* fs.writeFileString(CLIENT_LIVE_PATH, telegramSource);

	yield* Console.log(`Wrote ${objects.length} object schemas and ${unions.length} union schemas to ${SCHEMA_PATH}`);
	yield* Console.log(`Wrote ${methods.length} HTTP API endpoints to ${HTTP_API_PATH}`);
	yield* Console.log(`Wrote ${methodErrors.size} method error doc(s) to ${ERRORS_PATH}`);
	yield* Console.log(`Wrote TelegramClient service to ${CLIENT_SERVICE_PATH}`);
	yield* Console.log(`Wrote Telegram layer to ${CLIENT_LIVE_PATH}`);
	if (placeholders.length > 0) {
		yield* Console.log(`Emitted ${placeholders.length} placeholder schema(s): ${placeholders.join(", ")}`);
	}
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
