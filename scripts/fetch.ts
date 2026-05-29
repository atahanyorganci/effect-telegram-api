import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, Layer } from "effect";
import { BOTS_API_DOCUMENT } from "./document.ts";
import { fetchDocument } from "./fetch-document.ts";

const layer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

const program = Effect.gen(function* () {
	const document = yield* fetchDocument(BOTS_API_DOCUMENT);
	yield* Console.log(`Fetched ${document.path} (${document.bytes} bytes, ${document.hash})`);
});

program.pipe(Effect.provide(layer), NodeRuntime.runMain);
