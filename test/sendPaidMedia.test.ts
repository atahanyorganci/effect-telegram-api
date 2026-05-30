import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendPaidMedia = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendPaidMedia, payload);

describe("sendPaidMedia", () => {
	describe("Telegram API errors", () => {
		it.effect("MediaRequired when media is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendPaidMedia(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MediaRequired>(
					error,
					"MediaRequired",
					'Bad Request: parameter "media" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendPaidMedia(token, { chat_id: 1 }));
});
