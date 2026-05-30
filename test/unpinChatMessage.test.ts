import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callUnpinChatMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unpinChatMessage, payload);

describe("unpinChatMessage", () => {
	describe("Telegram API errors", () => {
		it.effect("MessageToUnpinNotFound when message_id is missing in a supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callUnpinChatMessage(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToUnpinNotFound>(
					error,
					"MessageToUnpinNotFound",
					"Bad Request: message to unpin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToUnpinNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callUnpinChatMessage(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToUnpinNotFound>(
					error,
					"MessageToUnpinNotFound",
					"Bad Request: message to unpin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnpinChatMessage(token, { chat_id: 1, message_id: 1 }));
});
