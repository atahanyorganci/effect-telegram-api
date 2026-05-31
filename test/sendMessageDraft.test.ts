import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendMessageDraft = (token: string, payload: unknown) =>
	callClient("sendMessageDraft", token, payload as never);

liveTests("sendMessageDraft", test => {
	describe("Telegram API errors", () => {
		test.effect("RandomIdInvalid when draft_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendMessageDraft(botToken, { chat_id: chatId }));
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendMessageDraft(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSendMessageDraft(token, { chat_id: 0, draft_id: 0 }));
});
