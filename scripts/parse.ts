import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { BOTS_API_DOCUMENT } from "./document.ts";
import { loadDocument } from "./parse/load-document.ts";
import { parseAvailableMethods } from "./parse/parse-methods.ts";
import { parseAvailableObjects } from "./parse/parse-objects.ts";

const program = Effect.gen(function* () {
	const html = yield* loadDocument(BOTS_API_DOCUMENT.path);
	const { objects } = yield* parseAvailableObjects(html, BOTS_API_DOCUMENT.specDir);
	const { methods } = yield* parseAvailableMethods(html, BOTS_API_DOCUMENT.specDir);
	yield* Console.log(`Wrote ${objects.length} objects to ${BOTS_API_DOCUMENT.specDir}/objects/`);
	yield* Console.log(`Wrote ${methods.length} methods to ${BOTS_API_DOCUMENT.specDir}/methods/`);
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
