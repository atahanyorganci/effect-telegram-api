import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendAudio = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendAudio, payload);

describe("sendAudio", () => {
	describe("Telegram API errors", () => {
		it.effect("NoAudioInRequest when audio is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendAudio(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoAudioInRequest>(
					error,
					"NoAudioInRequest",
					"Bad Request: there is no audio in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendAudio(token, { chat_id: 1 }));
});
