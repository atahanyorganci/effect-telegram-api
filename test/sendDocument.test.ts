import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSendDocument = (token: string, payload: unknown = {}) =>
	callClient("sendDocument", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("sendDocument", test => {
	describe("Telegram API errors", () => {
		test.effect("NoDocumentInRequest when document is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendDocument(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoDocumentInRequest", "Bad Request: there is no document in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendDocument(token, { chat_id: 1, document: "invalid" }));
});
