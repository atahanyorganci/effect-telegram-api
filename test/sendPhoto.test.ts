import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendPhoto = (token: string, payload: unknown = {}) => callClient("sendPhoto", token, payload as never);

liveTests("sendPhoto", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendPhoto(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendPhoto(token, { chat_id: 1, photo: "invalid" }));
});
