import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetManagedBotAccessSettings = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setManagedBotAccessSettings, payload);

describe("setManagedBotAccessSettings", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetManagedBotAccessSettings(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetManagedBotAccessSettings(token, { user_id: 0, is_access_restricted: false }));
});
