import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendVoice = (token: string, payload: unknown = {}) => callClient("sendVoice", token, payload as never);

liveTests("sendVoice", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when voice is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendVoice(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendVoice(token, { chat_id: 1, voice: "invalid" }));
});
