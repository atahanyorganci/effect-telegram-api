import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSendAudio = (token: string, payload: unknown = {}) => callClient("sendAudio", token, payload as never);

liveTests("sendAudio", test => {
	describe("Telegram API errors", () => {
		test.effect("NoAudioInRequest when audio is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendAudio(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoAudioInRequest", "Bad Request: there is no audio in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendAudio(token, { chat_id: 1, audio: "invalid" }));
});
