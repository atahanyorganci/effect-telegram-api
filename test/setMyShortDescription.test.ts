import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callSetMyShortDescription = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyShortDescription, payload);

describe("setMyShortDescription", () => {
	describe("success", () => {
		it.effect("returns true when clearing the bot short description", () =>
			Effect.gen(function* () {
				const result = yield* callSetMyShortDescription(requireBotToken(), { short_description: "" });

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMyShortDescription(token, { short_description: "" }));
});
