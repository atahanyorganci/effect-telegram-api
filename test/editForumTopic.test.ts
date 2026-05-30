import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callEditForumTopic = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.editForumTopic, payload);

describe("editForumTopic", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callEditForumTopic(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callEditForumTopic(token, { chat_id: 0, message_thread_id: 0 }));
});
