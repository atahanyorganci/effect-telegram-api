import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSavePreparedInlineMessage = (token: string, payload: unknown) =>
	callClient("savePreparedInlineMessage", token, payload as never);

liveTests("savePreparedInlineMessage", test => {
	describe("Telegram API errors", () => {
		test.effect("CantFindFieldType when result is missing the type field", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSavePreparedInlineMessage(botToken, {
					user_id: chatId,
					result: {},
				}).pipe(Effect.flip);

				expectErrorTag(error, "CantFindFieldType", 'Bad Request: can\'t find field "type"');
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSavePreparedInlineMessage(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSavePreparedInlineMessage(token, { user_id: 0, result: {} }));
});
