import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendVideoNote = (token: string, payload: unknown = {}) =>
	callClient("sendVideoNote", token, payload as never);

liveTests("sendVideoNote", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when video_note is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendVideoNote(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendVideoNote(token, { chat_id: 1, video_note: "invalid" }));
});
