import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSendLivePhoto = (token: string, payload: unknown = {}) =>
	callClient("sendLivePhoto", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("sendLivePhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("NoLivePhotoInRequest when live photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendLivePhoto(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoLivePhotoInRequest", "Bad Request: there is no live photo in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendLivePhoto(token, { chat_id: 1, photo: "invalid" }));
});
