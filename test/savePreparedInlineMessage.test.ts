import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSavePreparedInlineMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.savePreparedInlineMessage, payload);

describe("savePreparedInlineMessage", () => {
	describe("Telegram API errors", () => {
		it.effect("CantFindFieldType when result is missing the type field", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSavePreparedInlineMessage(botToken, {
					user_id: chatId,
					result: {},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantFindFieldType>(
					error,
					"CantFindFieldType",
					'Bad Request: can\'t find field "type"',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSavePreparedInlineMessage(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSavePreparedInlineMessage(token, { user_id: 0, result: {} }));
});
