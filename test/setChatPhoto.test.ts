import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSetChatPhoto = (token: string, payload: unknown = {}) =>
	callClient("setChatPhoto", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("setChatPhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("NoPhotoInRequest when photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatPhoto(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoPhotoInRequest", "Bad Request: there is no photo in the request");
			}),
		);
	});

	authErrorTests(test, token => callSetChatPhoto(token, { chat_id: 1, photo: "invalid" }));
});
