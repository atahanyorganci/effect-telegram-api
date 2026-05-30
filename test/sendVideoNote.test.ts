import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendVideoNote = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendVideoNote, payload);

describe("sendVideoNote", () => {
	describe("Telegram API errors", () => {
		it.effect("NoVideoNoteInRequest when video_note is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideoNote(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoVideoNoteInRequest>(
					error,
					"NoVideoNoteInRequest",
					"Bad Request: there is no video note in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendVideoNote(token, { chat_id: 1 }));
});
