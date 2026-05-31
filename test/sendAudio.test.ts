import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendAudio = (token: string, payload: unknown = {}) => callClient("sendAudio", token, payload as never);

liveTests("sendAudio", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when audio is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendAudio(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendAudio(token, { chat_id: 1, audio: "invalid" }));
});
