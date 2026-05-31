import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";
import { expectEditedMessage } from "./updatingMessagesHelpers.ts";

const callEditMessageReplyMarkup = (token: string, payload: unknown) =>
	callClient("editMessageReplyMarkup", token, payload as never);

liveTests("editMessageReplyMarkup", test => {
	describe("success", () => {
		test.effect("edits inline keyboard markup on an existing message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callClient("sendMessage", botToken, {
					chat_id: chatId,
					text: "telegram-api edit markup target",
					reply_markup: {
						inline_keyboard: [[{ text: "before", callback_data: "before" }]],
					},
				});

				const edited = yield* callEditMessageReplyMarkup(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
					reply_markup: {
						inline_keyboard: [[{ text: "after", callback_data: "after" }]],
					},
				});
				expectEditedMessage(edited, message.message_id);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToEditNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callEditMessageReplyMarkup(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
					reply_markup: { inline_keyboard: [] },
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: message to edit not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callEditMessageReplyMarkup(token, {
			chat_id: 1,
			message_id: 1,
			reply_markup: { inline_keyboard: [] },
		}),
	);
});
