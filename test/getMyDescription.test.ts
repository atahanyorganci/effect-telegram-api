import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetMyDescription = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMyDescription);

describe("getMyDescription", () => {
	describe("success", () => {
		it.effect("returns the bot description", () =>
			Effect.gen(function* () {
				const description = yield* callGetMyDescription(requireBotToken());

				assert.strictEqual(typeof description.description, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyDescription);
});
