import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSavePreparedInlineMessage = (token: string, payload: unknown) =>
	callClient("savePreparedInlineMessage", token, payload as never);

const minimalInlineQueryResult = {
	type: "article",
	id: "1",
	title: "t",
	input_message_content: { message_text: "m" },
} as const;

liveTests("savePreparedInlineMessage", test => {
	describe("Telegram API errors", () => {
		test.effect("CantFindFieldType when result is missing the type field", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSavePreparedInlineMessage(botToken, {
						user_id: chatId,
						result: {},
					}),
				);
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSavePreparedInlineMessage(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callSavePreparedInlineMessage(token, { user_id: 0, result: minimalInlineQueryResult }),
	);
});
