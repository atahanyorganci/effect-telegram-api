import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callPinChatMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.pinChatMessage, payload);

describe("pinChatMessage", () => {
	describe("success", () => {
		it.effect("returns true when pinning a message", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const source = yield* Telegram.Client.callMethod(token, Telegram.Methods.sendDice, { chat_id: chatId });

				yield* callPinChatMessage(token, { chat_id: chatId, message_id: source.message_id }).pipe(
					Effect.tap(result => Effect.sync(() => assert.strictEqual(result, true))),
					Effect.ensuring(
						Telegram.Client.callMethod(token, Telegram.Methods.unpinChatMessage, {
							chat_id: chatId,
							message_id: source.message_id,
						}).pipe(Effect.ignore),
					),
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("returns true when pinning a message in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken: token, groupId } = yield* telegramConfig;
				const source = yield* Telegram.Client.callMethod(token, Telegram.Methods.sendDice, { chat_id: groupId });

				yield* callPinChatMessage(token, { chat_id: groupId, message_id: source.message_id }).pipe(
					Effect.tap(result => Effect.sync(() => assert.strictEqual(result, true))),
					Effect.ensuring(
						Telegram.Client.callMethod(token, Telegram.Methods.unpinChatMessage, {
							chat_id: groupId,
							message_id: source.message_id,
						}).pipe(Effect.ignore),
					),
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MessageToPinNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callPinChatMessage(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToPinNotFound>(
					error,
					"MessageToPinNotFound",
					"Bad Request: message to pin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToPinNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callPinChatMessage(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToPinNotFound>(
					error,
					"MessageToPinNotFound",
					"Bad Request: message to pin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callPinChatMessage(botToken, { chat_id: 0, message_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callPinChatMessage(token, { chat_id: 1, message_id: 1 }));
});
