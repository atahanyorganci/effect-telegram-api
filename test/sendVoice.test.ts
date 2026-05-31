import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSendVoice = (token: string, payload: unknown = {}) =>
	callClient("sendVoice", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("sendVoice", test => {
	describe("Telegram API errors", () => {
		test.effect("NoVoiceInRequest when voice is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVoice(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoVoiceInRequest", "Bad Request: there is no voice in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendVoice(token, { chat_id: 1, voice: "invalid" }));
});
