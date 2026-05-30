import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendDocument = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendDocument, payload);

describe("sendDocument", () => {
	describe("Telegram API errors", () => {
		it.effect("NoDocumentInRequest when document is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendDocument(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoDocumentInRequest>(
					error,
					"NoDocumentInRequest",
					"Bad Request: there is no document in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendDocument(token, { chat_id: 1 }));
});
