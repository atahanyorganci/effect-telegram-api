import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { callMethod } from "../src/client.ts";
import { getMe } from "../src/methods.ts";

const TestLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

describe("getMe", () => {
	it.effect("returns the authenticated bot user", () =>
		Effect.gen(function* () {
			const token = process.env.TELEGRAM_BOT_TOKEN;
			if (token === undefined || token === "") {
				assert.fail("TELEGRAM_BOT_TOKEN is not set (add it to .env)");
			}

			const me = yield* callMethod(token, getMe);

			assert.strictEqual(me.is_bot, true);
			assert.strictEqual(typeof me.id, "number");
			assert.strictEqual(typeof me.first_name, "string");
		}).pipe(Effect.provide(TestLayer)),
	);
});
