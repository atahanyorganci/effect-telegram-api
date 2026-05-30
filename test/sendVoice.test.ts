import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendVoice = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendVoice, payload);

describe("sendVoice", () => {
	describe("Telegram API errors", () => {
		it.effect("NoVoiceInRequest when voice is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVoice(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoVoiceInRequest>(
					error,
					"NoVoiceInRequest",
					"Bad Request: there is no voice in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendVoice(token, { chat_id: 1 }));
});
