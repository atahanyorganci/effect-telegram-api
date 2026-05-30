import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { callMethod } from "./client.ts";
import { getMe } from "./methods.ts";

const layer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

const program = Effect.gen(function* () {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (token === undefined || token === "") {
		yield* Console.error("Set TELEGRAM_BOT_TOKEN to run the getMe smoke test.");
		return;
	}

	const me = yield* callMethod(token, getMe);
	yield* Console.log("getMe ->", me);
});

program.pipe(Effect.provide(layer), NodeRuntime.runMain);
