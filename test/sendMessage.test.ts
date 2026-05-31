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

const callSendMessage = (token: string, payload: unknown) => callClient("sendMessage", token, payload as never);

liveTests("sendMessage", test => {
	describe("success", () => {
		test.effect("sends a message when chat_id and text are valid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api test");
			}),
		);

		test.effect("sends a message that is 4096 characters long", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const text = "x".repeat(4096);
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, text);
			}),
		);

		test.effect("sends a message with HTML parse_mode", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<b>telegram-api</b> test",
					parse_mode: "HTML",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api test");
			}),
		);

		test.effect("sends a message with disable_notification", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api silent test",
					disable_notification: true,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api silent test");
			}),
		);

		test.effect("sends a message with link preview disabled", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "https://example.com",
					link_preview_options: { is_disabled: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with Markdown parse_mode", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "*bold*",
					parse_mode: "Markdown",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "bold");
			}),
		);

		test.effect("sends a message with MarkdownV2 parse_mode", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "*bold*",
					parse_mode: "MarkdownV2",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "bold");
			}),
		);

		test.effect("sends a message with protect_content", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api protected test",
					protect_content: true,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api protected test");
			}),
		);

		test.effect("sends a message with a valid inline keyboard", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api inline keyboard test",
					reply_markup: {
						inline_keyboard: [[{ text: "ok", callback_data: "ok" }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with manual entities", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello",
					entities: [{ type: "bold", offset: 0, length: 5 }],
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "hello");
			}),
		);

		test.effect("sends a message with force reply markup", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api force reply test",
					reply_markup: { force_reply: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with reply keyboard markup", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api reply keyboard test",
					reply_markup: {
						keyboard: [[{ text: "A" }]],
						resize_keyboard: true,
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with remove keyboard markup", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api remove keyboard test",
					reply_markup: { remove_keyboard: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with link preview above text", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "https://example.com",
					link_preview_options: { show_above_text: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with nested HTML tags", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<b><i>nested</i></b>",
					parse_mode: "HTML",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "nested");
			}),
		);

		test.effect("sends a reply to a previously sent message", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const original = yield* callSendMessage(token, {
					chat_id: chatId,
					text: "telegram-api reply target",
				});

				const reply = yield* callSendMessage(token, {
					chat_id: chatId,
					text: "telegram-api reply",
					reply_parameters: { message_id: original.message_id },
				});

				assert.strictEqual(typeof reply.message_id, "number");
				assert.strictEqual(reply.reply_to_message?.message_id, original.message_id);
			}),
		);

		test.effect("sends a message with switch_inline_query button", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api switch inline test",
					reply_markup: {
						inline_keyboard: [[{ text: "Search", switch_inline_query: "query" }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with copy_text button", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api copy button test",
					reply_markup: {
						inline_keyboard: [[{ text: "Copy", copy_text: { text: "copied text" } }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with maximum length callback_data", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api max callback_data test",
					reply_markup: {
						inline_keyboard: [[{ text: "btn", callback_data: "x".repeat(64) }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with spoiler entity", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "secret",
					entities: [{ type: "spoiler", offset: 0, length: 6 }],
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "secret");
			}),
		);

		test.effect("sends a message with underline and strikethrough entities", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "formatted",
					entities: [
						{ type: "underline", offset: 0, length: 9 },
						{ type: "strikethrough", offset: 0, length: 9 },
					],
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with blockquote entities", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "quoted",
					entities: [
						{ type: "blockquote", offset: 0, length: 6 },
						{ type: "expandable_blockquote", offset: 0, length: 6 },
					],
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with HTML spoiler and blockquote tags", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<tg-spoiler>secret</tg-spoiler>\n<blockquote expandable>quote</blockquote>",
					parse_mode: "HTML",
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with link preview url override", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "preview override",
					link_preview_options: { url: "https://example.com", prefer_large_media: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with force reply placeholder", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api placeholder test",
					reply_markup: { force_reply: true, input_field_placeholder: "type here" },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with request contact and location keyboard", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api request keyboard test",
					reply_markup: {
						keyboard: [
							[
								{ text: "Share contact", request_contact: true },
								{ text: "Share location", request_location: true },
							],
						],
						resize_keyboard: true,
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with escaped MarkdownV2 punctuation", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello\\.",
					parse_mode: "MarkdownV2",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "hello.");
			}),
		);

		test.effect("sends a message when replying to a missing message with allow_sending_without_reply", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "telegram-api optional reply test",
					reply_parameters: { message_id: 999999999, allow_sending_without_reply: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);

		test.effect("sends a message with case-insensitive parse_mode", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<b>lower</b>",
					parse_mode: "html",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "lower");
			}),
		);

		test.effect("sends a message with automatic entity types", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "/start #tag $USD a@b.com https://example.com +1234567890",
					entities: [
						{ type: "bot_command", offset: 0, length: 6 },
						{ type: "hashtag", offset: 7, length: 4 },
						{ type: "cashtag", offset: 12, length: 4 },
						{ type: "email", offset: 17, length: 7 },
						{ type: "url", offset: 25, length: 19 },
						{ type: "phone_number", offset: 45, length: 11 },
					],
				});

				assert.strictEqual(typeof message.message_id, "number");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageTextEmpty when text is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendMessage(botToken, { chat_id: chatId }));
			}),
		);

		test.effect("MessageTextEmpty when text is an empty string", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "",
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageTextEmpty", "Bad Request: message text is empty");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendMessage(botToken, { text: "test" }));
			}),
		);

		test.effect("ChatIdEmpty when chat_id is an empty string", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, { chat_id: "", text: "test" }).pipe(Effect.flip);

				expectErrorTag(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, { chat_id: 0, text: "test" }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatNotFound when chat_id is an unresolvable @username", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: "@this_channel_does_not_exist_12345xyz",
					text: "test",
				}).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatNotFound when chat_id is a non-numeric string", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, { chat_id: "not_a_chat", text: "test" }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("MessageTooLong when text is longer than 4096 characters", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "x".repeat(4097),
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageTooLong", "Bad Request: message is too long");
			}),
		);

		test.effect("UnsupportedParseMode when parse_mode is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					parse_mode: "INVALID",
				}).pipe(Effect.flip);

				expectErrorTag(error, "UnsupportedParseMode", "Bad Request: unsupported parse_mode");
			}),
		);

		test.effect("CantParseEntitiesNoEnd when Markdown entity is unclosed", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "*unclosed",
					parse_mode: "Markdown",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesNoEnd",
					"Bad Request: can't parse entities: Can't find end of the entity starting at byte offset 0",
				);
			}),
		);

		test.effect("CantParseEntitiesNoBoldEnd when MarkdownV2 bold entity is unclosed", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "*unclosed",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesNoBoldEnd",
					"Bad Request: can't parse entities: Can't find end of Bold entity at byte offset 0",
				);
			}),
		);

		test.effect("CantParseEntitiesNoHtmlEndTag when HTML tag is unclosed", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<b>unclosed",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesNoHtmlEndTag",
					"Bad Request: can't parse entities: Can't find end tag corresponding to start tag \"b\"",
				);
			}),
		);

		test.effect("MessageThreadNotFound when message_thread_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					message_thread_id: 999999999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageThreadNotFound", "Bad Request: message thread not found");
			}),
		);

		test.effect("MessageToReplyNotFound when reply_parameters.message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_parameters: { message_id: 999999999 },
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToReplyNotFound", "Bad Request: message to be replied not found");
			}),
		);

		test.effect("EntityBeginsAfterTextEnd when entity offset is beyond the text", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello",
					entities: [{ type: "bold", offset: 100, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"EntityBeginsAfterTextEnd",
					"Bad Request: entity begins after the end of the text at UTF-16 offset 100",
				);
			}),
		);

		test.effect("EntityEndsAfterTextEnd when entity length exceeds the text", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello",
					entities: [{ type: "bold", offset: 0, length: 100 }],
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"EntityEndsAfterTextEnd",
					"Bad Request: entity beginning at UTF-16 offset 0 ends after the end of the text at UTF-16 offset 100",
				);
			}),
		);

		test.effect("UnsupportedMessageEntityType when entity type is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello",
					entities: [{ type: "invalid_type", offset: 0, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"UnsupportedMessageEntityType",
					"Bad Request: can't parse MessageEntity: Unsupported type specified",
				);
			}),
		);

		test.effect("ButtonDataInvalid when inline keyboard callback_data is too long", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: {
						inline_keyboard: [[{ text: "btn", callback_data: "x".repeat(100) }]],
					},
				}).pipe(Effect.flip);

				expectErrorTag(error, "ButtonDataInvalid", "Bad Request: BUTTON_DATA_INVALID");
			}),
		);

		test.effect("BusinessConnectionNotFound when business_connection_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					business_connection_id: "invalid",
				}).pipe(Effect.flip);

				expectErrorTag(error, "BusinessConnectionNotFound", "Bad Request: business connection not found");
			}),
		);

		test.effect("EffectIdInvalid when message_effect_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					message_effect_id: "9999999999999999999",
				}).pipe(Effect.flip);

				expectErrorTag(error, "EffectIdInvalid", "Bad Request: EFFECT_ID_INVALID");
			}),
		);

		test.effect("FloodskipNotAllowed when allow_paid_broadcast is true without sufficient Stars", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					allow_paid_broadcast: true,
				}).pipe(Effect.flip);

				expectErrorTag(error, "FloodskipNotAllowed", "Bad Request: FLOODSKIP_NOT_ALLOWED");
			}),
		);

		test.effect("InlineButtonUrlInvalid when inline keyboard url is not a valid HTTP URL", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "link", url: "not-a-url" }]] },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"InlineButtonUrlInvalid",
					"Bad Request: inline keyboard button URL 'not-a-url' is invalid: Wrong HTTP URL",
				);
			}),
		);

		test.effect("InlineButtonUrlFtpUnsupported when inline keyboard url uses FTP", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "link", url: "ftp://example.com" }]] },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"InlineButtonUrlFtpUnsupported",
					"Bad Request: inline keyboard button URL 'ftp://example.com' is invalid: Unsupported URL protocol",
				);
			}),
		);

		test.effect("InlineButtonTextUnallowed when inline keyboard button has empty callback_data", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "btn", callback_data: "" }]] },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"InlineButtonTextUnallowed",
					"Bad Request: can't parse inline keyboard button: Text buttons are unallowed in the inline keyboard",
				);
			}),
		);

		test.effect("EntityUrlInvalid when text_link entity url is not valid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "click",
					entities: [{ type: "text_link", offset: 0, length: 5, url: "not-a-url" }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "EntityUrlInvalid", "Bad Request: entity URL 'not-a-url' is invalid: Wrong HTTP URL");
			}),
		);

		test.effect("EntityUrlEmpty when text_link entity url is empty", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "click",
					entities: [{ type: "text_link", offset: 0, length: 5, url: "" }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "EntityUrlEmpty", "Bad Request: entity URL '' is invalid: URL host is empty");
			}),
		);

		test.effect("EntityIncorrectOffset when entity offset is negative", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello",
					entities: [{ type: "bold", offset: -1, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "EntityIncorrectOffset", "Bad Request: receive an entity with incorrect offset -1");
			}),
		);

		test.effect("CustomEmojiIdMustBeNumber when custom_emoji_id is not numeric", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "x",
					entities: [{ type: "custom_emoji", offset: 0, length: 1, custom_emoji_id: "9999999999999999999" }],
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CustomEmojiIdMustBeNumber",
					'Bad Request: can\'t parse MessageEntity: Field "custom_emoji_id" must be a valid Number',
				);
			}),
		);

		test.effect("UserNotFound when text_mention entity user does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "user",
					entities: [{ type: "text_mention", offset: 0, length: 4, user: { id: 0, is_bot: false, first_name: "X" } }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "UserNotFound", "Bad Request: user not found");
			}),
		);

		test.effect("CantParseEntitiesReservedCharDot when MarkdownV2 period is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello.",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharDot",
					"Bad Request: can't parse entities: Character '.' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharDash when MarkdownV2 hyphen is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "a-b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharDash",
					"Bad Request: can't parse entities: Character '-' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharExclamation when MarkdownV2 exclamation is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "hello!",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharExclamation",
					"Bad Request: can't parse entities: Character '!' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesUnsupportedScriptTag when HTML contains script tag", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<script>alert(1)</script>",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesUnsupportedScriptTag",
					'Bad Request: can\'t parse entities: Unsupported start tag "script" at byte offset 0',
				);
			}),
		);

		test.effect("CantParseEntitiesUnsupportedTag when HTML contains unknown tag", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<invalid>test</invalid>",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesUnsupportedTag",
					'Bad Request: can\'t parse entities: Unsupported start tag "invalid" at byte offset 0',
				);
			}),
		);

		test.effect("CantParseEntitiesUnmatchedEndTag when HTML closing tags are mismatched", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "<b><i>test</b></i>",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesUnmatchedEndTag",
					'Bad Request: can\'t parse entities: Unmatched end tag at byte offset 10, expected "</i>", found "</b>"',
				);
			}),
		);

		test.effect("ReplyMessageIdMissing when reply_parameters has no message_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_parameters: { quote: "hello" },
					}),
				);
			}),
		);

		test.effect("SuggestedPostChannelOnly when suggested_post_parameters is used in a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					suggested_post_parameters: {},
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"SuggestedPostChannelOnly",
					"Bad Request: suggested posts can be sent only to channel direct messages",
				);
			}),
		);

		test.effect("InvalidStarsAmount when suggested_post_parameters price is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					suggested_post_parameters: { price: { currency: "XTR", amount: 1 } },
				}).pipe(Effect.flip);

				expectErrorTag(error, "InvalidStarsAmount", "Bad Request: invalid amount of Telegram Stars specified");
			}),
		);

		test.effect("WebpageUrlInvalid when link_preview_options.url is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					link_preview_options: { url: "not-a-url" },
				}).pipe(Effect.flip);

				expectErrorTag(error, "WebpageUrlInvalid", "Bad Request: WEBPAGE_URL_INVALID");
			}),
		);

		test.effect("PreferSmallMediaMustBeBoolean when link_preview_options.prefer_small_media is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "https://example.com",
						link_preview_options: { prefer_small_media: "yes" },
					}),
				);
			}),
		);

		test.effect("LinkPreviewIsDisabledMustBeBoolean when link_preview_options.is_disabled is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						link_preview_options: { is_disabled: "yes" },
					}),
				);
			}),
		);

		test.effect("ForceReplyMustBeBoolean when force_reply is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { force_reply: "yes" },
					}),
				);
			}),
		);

		test.effect("RemoveKeyboardMustBeBoolean when remove_keyboard is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { remove_keyboard: "yes" },
					}),
				);
			}),
		);

		test.effect("InlineKeyboardMustBeArray when inline_keyboard is not an array", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { inline_keyboard: "bad" },
					}),
				);
			}),
		);

		test.effect("SelectiveMustBeBoolean when reply keyboard selective is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { keyboard: [[{ text: "A" }]], selective: "yes" },
					}),
				);
			}),
		);

		test.effect("OneTimeKeyboardMustBeBoolean when one_time_keyboard is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { keyboard: [[{ text: "A" }]], one_time_keyboard: "yes" },
					}),
				);
			}),
		);

		test.effect("IsPersistentMustBeBoolean when is_persistent is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { keyboard: [[{ text: "A" }]], is_persistent: "yes" },
					}),
				);
			}),
		);

		test.effect("WebAppUrlNotHttps when web_app url is not HTTPS", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "app", web_app: { url: "bad" } }]] },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"WebAppUrlNotHttps",
					"Bad Request: inline keyboard button Web App URL 'bad' is invalid: Only HTTPS links are allowed",
				);
			}),
		);

		test.effect("WebAppUrlHttpNotAllowed when web_app url is HTTP", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "app", web_app: { url: "http://example.com" } }]] },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"WebAppUrlHttpNotAllowed",
					"Bad Request: inline keyboard button Web App URL 'http://example.com' is invalid: Only HTTPS links are allowed",
				);
			}),
		);

		test.effect("ButtonTypeInvalid when pay button is used without invoice", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "pay", pay: true }]] },
				}).pipe(Effect.flip);

				expectErrorTag(error, "ButtonTypeInvalid", "Bad Request: BUTTON_TYPE_INVALID");
			}),
		);

		test.effect("ButtonCopyTextInvalid when copy_text is empty", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "copy", copy_text: { text: "" } }]] },
				}).pipe(Effect.flip);

				expectErrorTag(error, "ButtonCopyTextInvalid", "Bad Request: BUTTON_COPY_TEXT_INVALID");
			}),
		);

		test.effect("ButtonQuantityMaxInvalid when request_users max_quantity is too large", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: {
						keyboard: [[{ text: "users", request_users: { request_id: 1, user_is_bot: true, max_quantity: 999 } }]],
						resize_keyboard: true,
					},
				}).pipe(Effect.flip);

				expectErrorTag(error, "ButtonQuantityMaxInvalid", "Bad Request: BUTTON_QUANTITY_MAX_INVALID");
			}),
		);

		test.effect("LoginUrlBotNotFound when login_url bot_username does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "login",
									login_url: {
										url: "https://example.com",
										forward_text: "x",
										bot_username: "nonexistent_bot_xyz_12345",
										request_write_access: false,
									},
								},
							],
						],
					},
				}).pipe(Effect.flip);

				expectErrorTag(error, "LoginUrlBotNotFound", 'Bad Request: bot "nonexistent_bot_xyz_12345" not found');
			}),
		);

		test.effect("ChatNotFound when chat_id is negative", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, { chat_id: -1, text: "test" }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("TextMustBeNonEmpty when text is whitespace only", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "   ",
				}).pipe(Effect.flip);

				expectErrorTag(error, "TextMustBeNonEmpty", "Bad Request: text must be non-empty");
			}),
		);

		test.effect("BotDomainInvalid when login_url is missing bot_username", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "login",
									login_url: { url: "https://example.com", forward_text: "x", request_write_access: false },
								},
							],
						],
					},
				}).pipe(Effect.flip);

				expectErrorTag(error, "BotDomainInvalid", "Bad Request: BOT_DOMAIN_INVALID");
			}),
		);

		test.effect("CantParseEntitiesInvalidCustomEmoji when HTML tg-emoji id is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: '<tg-emoji emoji-id="9999999999999999999">x</tg-emoji>',
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesInvalidCustomEmoji",
					"Bad Request: can't parse entities: Invalid custom emoji identifier specified",
				);
			}),
		);

		test.effect("CustomEmojiIdMissing when custom_emoji entity has no custom_emoji_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "x",
					entities: [{ type: "custom_emoji", offset: 0, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CustomEmojiIdMissing",
					"Bad Request: can't parse MessageEntity: Can't find field \"custom_emoji_id\"",
				);
			}),
		);

		test.effect("InlineButtonTextMissing when inline keyboard button has no text", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { inline_keyboard: [[{ callback_data: "x" }]] },
					}),
				);
			}),
		);

		test.effect("TextLinkUrlMissing when text_link entity has no url", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "link",
					entities: [{ type: "text_link", offset: 0, length: 4 }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "TextLinkUrlMissing", "Bad Request: can't parse MessageEntity: Can't find field \"url\"");
			}),
		);

		test.effect("TextMentionUserMissing when text_mention entity has no user", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "user",
					entities: [{ type: "text_mention", offset: 0, length: 4 }],
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"TextMentionUserMissing",
					"Bad Request: can't parse MessageEntity: Can't find field \"user\"",
				);
			}),
		);

		test.effect("KeyboardRequestIdMissing when request_chat button has no request_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: {
							keyboard: [[{ text: "chat", request_chat: { chat_is_channel: true } }]],
							resize_keyboard: true,
						},
					}),
				);
			}),
		);

		test.effect("ChatIsForumMustBeBoolean when request_chat.chat_is_forum is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: {
							keyboard: [
								[{ text: "chat", request_chat: { request_id: 1, chat_is_channel: true, chat_is_forum: "yes" } }],
							],
							resize_keyboard: true,
						},
					}),
				);
			}),
		);

		test.effect("KeyboardWebAppUrlHttpNotAllowed when reply keyboard web_app url is HTTP", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: {
						keyboard: [[{ text: "app", web_app: { url: "http://example.com" } }]],
						resize_keyboard: true,
					},
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"KeyboardWebAppUrlHttpNotAllowed",
					"Bad Request: keyboard button Web App URL 'http://example.com' is invalid: Only HTTPS links are allowed",
				);
			}),
		);

		test.effect("PreferLargeMediaMustBeBoolean when prefer_large_media is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "https://example.com",
						link_preview_options: { prefer_large_media: "yes" },
					}),
				);
			}),
		);

		test.effect("ShowAboveTextMustBeBoolean when show_above_text is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "https://example.com",
						link_preview_options: { show_above_text: "yes" },
					}),
				);
			}),
		);

		test.effect("ResizeKeyboardMustBeBoolean when resize_keyboard is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { keyboard: [[{ text: "A" }]], resize_keyboard: "yes" },
					}),
				);
			}),
		);

		test.effect("KeyboardMustBeArray when keyboard is not an array", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: { keyboard: "bad" },
					}),
				);
			}),
		);

		test.effect("AllowUserChatsMustBeBoolean when allow_user_chats is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: {
							inline_keyboard: [[{ text: "q", switch_inline_query_chosen_chat: { allow_user_chats: "yes" } }]],
						},
					}),
				);
			}),
		);

		test.effect("RequestWriteAccessMustBeBoolean when request_write_access is not boolean", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendMessage(botToken, {
						chat_id: chatId,
						text: "test",
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: "login",
										login_url: {
											url: "https://example.com",
											forward_text: "x",
											bot_username: "telegram",
											request_write_access: "yes",
										},
									},
								],
							],
						},
					}),
				);
			}),
		);

		test.effect("LoginUrlBotNotFound when login_url bot_username is not a bot", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "login",
									login_url: {
										url: "https://example.com",
										forward_text: "x",
										bot_username: "telegram",
										request_write_access: false,
									},
								},
							],
						],
					},
				}).pipe(Effect.flip);

				expectErrorTag(error, "LoginUrlBotNotFound", 'Bad Request: bot "telegram" not found');
			}),
		);

		test.effect("CantParseEntitiesNoBoldEnd when MarkdownV2 nested formatting is unclosed", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "*bold _italic\\_*",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesNoBoldEnd",
					"Bad Request: can't parse entities: Can't find end of Bold entity at byte offset 15",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharParen when MarkdownV2 parenthesis is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test()",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharParen",
					"Bad Request: can't parse entities: Character '(' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharHash when MarkdownV2 hash is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "#tag",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharHash",
					"Bad Request: can't parse entities: Character '#' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharPlus when MarkdownV2 plus is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "a+b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharPlus",
					"Bad Request: can't parse entities: Character '+' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharEquals when MarkdownV2 equals is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "a=b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharEquals",
					"Bad Request: can't parse entities: Character '=' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharBrace when MarkdownV2 brace is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "a{b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharBrace",
					"Bad Request: can't parse entities: Character '{' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharGreater when MarkdownV2 greater-than is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "a>b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharGreater",
					"Bad Request: can't parse entities: Character '>' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("CantParseEntitiesReservedCharPipe when MarkdownV2 pipe is unescaped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "a|b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesReservedCharPipe",
					"Bad Request: can't parse entities: Character '|' is reserved and must be escaped with the preceding '\\'",
				);
			}),
		);

		test.effect("ButtonTypeInvalid when callback_game has no game attached", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "game", callback_game: {} }]] },
				}).pipe(Effect.flip);

				expectErrorTag(error, "ButtonTypeInvalid", "Bad Request: BUTTON_TYPE_INVALID");
			}),
		);

		test.effect("ButtonCopyTextInvalid when copy_text exceeds 256 characters", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendMessage(botToken, {
					chat_id: chatId,
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "copy", copy_text: { text: "x".repeat(257) } }]] },
				}).pipe(Effect.flip);

				expectErrorTag(error, "ButtonCopyTextInvalid", "Bad Request: BUTTON_COPY_TEXT_INVALID");
			}),
		);
	});

	authErrorTests(test, token => callSendMessage(token, { chat_id: 1, text: "test" }));
});
