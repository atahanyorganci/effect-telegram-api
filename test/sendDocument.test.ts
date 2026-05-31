import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendDocument = (token: string, payload: unknown = {}) => callClient("sendDocument", token, payload as never);

liveTests("sendDocument", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when document is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendDocument(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendDocument(token, { chat_id: 1, document: "invalid" }));
});
