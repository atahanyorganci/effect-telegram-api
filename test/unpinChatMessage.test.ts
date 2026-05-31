import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callUnpinChatMessage = (token: string, payload: unknown) =>
	callClient("unpinChatMessage", token, payload as never);

liveTests("unpinChatMessage", test => {
	describe("Telegram API errors", () => {
		test.effect("MessageToUnpinNotFound when message_id is missing in a supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callUnpinChatMessage(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag(error, "MessageToUnpinNotFound", "Bad Request: message to unpin not found");
			}),
		);

		test.effect("MessageToUnpinNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callUnpinChatMessage(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToUnpinNotFound", "Bad Request: message to unpin not found");
			}),
		);
	});

	authErrorTests(test, token => callUnpinChatMessage(token, { chat_id: 1, message_id: 1 }));
});
