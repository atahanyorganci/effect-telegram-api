import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";
import { expectEditedMessage } from "./updatingMessagesHelpers.ts";

const callEditMessageText = (token: string, payload: unknown) => callClient("editMessageText", token, payload as never);

liveTests("editMessageText", test => {
	describe("success", () => {
		test.effect("edits text on an existing message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callClient("sendMessage", botToken, {
					chat_id: chatId,
					text: "telegram-api edit target",
				});

				const edited = yield* callEditMessageText(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
					text: "telegram-api edited text",
				});
				expectEditedMessage(edited, message.message_id);
				assert.strictEqual((edited as { readonly text?: string }).text, "telegram-api edited text");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToEditNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callEditMessageText(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
					text: "telegram-api missing edit target",
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToEditNotFound", "Bad Request: message to edit not found");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callEditMessageText(botToken, {
					chat_id: 0,
					message_id: 1,
					text: "telegram-api invalid chat",
				}).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);
	});

	describe("client validation", () => {
		test.effect("requires text and a message target", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callEditMessageText(botToken, {
						chat_id: chatId,
						message_id: 1,
					}),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callEditMessageText(token, {
			chat_id: 1,
			message_id: 1,
			text: "telegram-api auth test",
		}),
	);
});
