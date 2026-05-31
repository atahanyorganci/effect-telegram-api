import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSendVideoNote = (token: string, payload: unknown = {}) =>
	callClient("sendVideoNote", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("sendVideoNote", test => {
	describe("Telegram API errors", () => {
		test.effect("NoVideoNoteInRequest when video_note is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideoNote(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoVideoNoteInRequest", "Bad Request: there is no video note in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendVideoNote(token, { chat_id: 1, video_note: "invalid" }));
});
