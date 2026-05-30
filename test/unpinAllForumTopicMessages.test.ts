import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callUnpinAllForumTopicMessages = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unpinAllForumTopicMessages, payload);

describe("unpinAllForumTopicMessages", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callUnpinAllForumTopicMessages(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnpinAllForumTopicMessages(token, { chat_id: 0, message_thread_id: 0 }));
});
