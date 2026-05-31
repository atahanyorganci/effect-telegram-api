import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendLivePhoto = (token: string, payload: unknown = {}) =>
	callClient("sendLivePhoto", token, payload as never);

liveTests("sendLivePhoto", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when live photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendLivePhoto(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendLivePhoto(token, { chat_id: 1, live_photo: "invalid", photo: "invalid" }));
});
