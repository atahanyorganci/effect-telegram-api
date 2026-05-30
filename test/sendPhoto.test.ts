import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendPhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendPhoto, payload);

describe("sendPhoto", () => {
	describe("Telegram API errors", () => {
		it.effect("NoPhotoInRequest when photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendPhoto(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoPhotoInRequest>(
					error,
					"NoPhotoInRequest",
					"Bad Request: there is no photo in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendPhoto(token, { chat_id: 1 }));
});
