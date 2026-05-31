import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callDeclineSuggestedPost = (token: string, payload: unknown) =>
	callClient("declineSuggestedPost", token, payload as never);

liveTests("declineSuggestedPost", test => {
	describe("Telegram API errors", () => {
		test.effect("SuggestedPostNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callDeclineSuggestedPost(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "SuggestedPostNotFound", "Bad Request: suggested post not found");
			}),
		);
	});

	describe("client validation", () => {
		test.effect("requires chat_id and message_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeclineSuggestedPost(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callDeclineSuggestedPost(token, { chat_id: 1, message_id: 1 }));
});
