import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { parse } from "node-html-parser";
import { BOTS_API_DOCUMENT } from "./document.ts";
import { parseError } from "./parse/errors.ts";
import { loadDocument } from "./parse/load-document.ts";
import { parseObjectBlock } from "./parse/parse-object-block.ts";

const layer = NodeServices.layer;

const program = Effect.gen(function* () {
	const html = yield* loadDocument(BOTS_API_DOCUMENT.path);
	const root = parse(html);
	const heading = root.querySelector('h4[id="user"]');

	if (heading === null) {
		return yield* Effect.fail(parseError('Expected object heading h4[id="user"]'));
	}

	const user = yield* parseObjectBlock(heading);
	yield* Console.log(JSON.stringify(user, null, "\t"));
});

program.pipe(Effect.provide(layer), NodeRuntime.runMain);
