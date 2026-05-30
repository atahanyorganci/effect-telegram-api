import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendChatAction = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendChatAction, payload);

describe("sendChatAction", () => {
	describe("success", () => {
		it.effect("returns true when broadcasting a typing action", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const result = yield* callSendChatAction(botToken, {
					chat_id: chatId,
					action: "typing",
				});

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("returns true when broadcasting a typing action in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const result = yield* callSendChatAction(botToken, {
					chat_id: groupId,
					action: "typing",
				});

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendChatAction(botToken, { action: "typing" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendChatAction(botToken, { chat_id: 0, action: "typing" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("WrongParameterAction when action is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendChatAction(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.WrongParameterAction>(
					error,
					"WrongParameterAction",
					"Bad Request: wrong parameter action in request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("WrongParameterAction when action is not supported", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendChatAction(botToken, {
					chat_id: chatId,
					action: "invalid",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.WrongParameterAction>(
					error,
					"WrongParameterAction",
					"Bad Request: wrong parameter action in request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendChatAction(token, { chat_id: 1, action: "typing" }));
});
