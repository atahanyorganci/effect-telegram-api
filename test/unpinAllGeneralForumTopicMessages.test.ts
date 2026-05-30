import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callUnpinAllGeneralForumTopicMessages = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unpinAllGeneralForumTopicMessages, payload);

describe("unpinAllGeneralForumTopicMessages", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callUnpinAllGeneralForumTopicMessages(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnpinAllGeneralForumTopicMessages(token, { chat_id: 0 }));
});
