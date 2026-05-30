import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendMessageDraft = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendMessageDraft, payload);

describe("sendMessageDraft", () => {
	describe("Telegram API errors", () => {
		it.effect("RandomIdInvalid when draft_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessageDraft(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.RandomIdInvalid>(error, "RandomIdInvalid", "Bad Request: RANDOM_ID_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendMessageDraft(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendMessageDraft(token, { chat_id: 0, draft_id: 0 }));
});
