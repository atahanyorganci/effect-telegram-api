import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetManagedBotAccessSettings = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getManagedBotAccessSettings, payload);

describe("getManagedBotAccessSettings", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callGetManagedBotAccessSettings(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetManagedBotAccessSettings(token, { user_id: 0 }));
});
