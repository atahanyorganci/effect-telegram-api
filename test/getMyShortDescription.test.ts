import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetMyShortDescription = (token: string) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getMyShortDescription);

describe("getMyShortDescription", () => {
	describe("success", () => {
		it.effect("returns the bot short description", () =>
			Effect.gen(function* () {
				const short = yield* callGetMyShortDescription(requireBotToken());

				assert.strictEqual(typeof short.short_description, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyShortDescription);
});
