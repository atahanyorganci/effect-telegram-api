import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSendPhoto = (token: string, payload: unknown = {}) => callClient("sendPhoto", token, payload as never);

liveTests("sendPhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("NoPhotoInRequest when photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendPhoto(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoPhotoInRequest", "Bad Request: there is no photo in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendPhoto(token, { chat_id: 1, photo: "invalid" }));
});
