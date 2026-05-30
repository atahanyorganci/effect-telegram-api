import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSavePreparedKeyboardButton = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.savePreparedKeyboardButton, payload);

describe("savePreparedKeyboardButton", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSavePreparedKeyboardButton(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callSavePreparedKeyboardButton(token, { user_id: 0, button: { text: "test", request_id: "invalid" } }),
	);
});
