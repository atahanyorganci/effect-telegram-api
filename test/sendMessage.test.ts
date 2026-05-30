import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendMessage, payload);

describe("sendMessage", () => {
	describe("success", () => {
		it.effect("sends a message when chat_id and text are valid", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api test");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message that is 4096 characters long", () =>
			Effect.gen(function* () {
				const text = "x".repeat(4096);
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, text);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with HTML parse_mode", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<b>telegram-api</b> test",
					parse_mode: "HTML",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api test");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with disable_notification", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api silent test",
					disable_notification: true,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api silent test");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with link preview disabled", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "https://example.com",
					link_preview_options: { is_disabled: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with Markdown parse_mode", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "*bold*",
					parse_mode: "Markdown",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "bold");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with MarkdownV2 parse_mode", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "*bold*",
					parse_mode: "MarkdownV2",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "bold");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with protect_content", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api protected test",
					protect_content: true,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api protected test");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with a valid inline keyboard", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api inline keyboard test",
					reply_markup: {
						inline_keyboard: [[{ text: "ok", callback_data: "ok" }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with manual entities", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello",
					entities: [{ type: "bold", offset: 0, length: 5 }],
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "hello");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with force reply markup", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api force reply test",
					reply_markup: { force_reply: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with reply keyboard markup", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api reply keyboard test",
					reply_markup: {
						keyboard: [[{ text: "A" }]],
						resize_keyboard: true,
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with remove keyboard markup", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api remove keyboard test",
					reply_markup: { remove_keyboard: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with link preview above text", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "https://example.com",
					link_preview_options: { show_above_text: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with nested HTML tags", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<b><i>nested</i></b>",
					parse_mode: "HTML",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "nested");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a reply to a previously sent message", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const chatId = requireChatId();
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
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with switch_inline_query button", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api switch inline test",
					reply_markup: {
						inline_keyboard: [[{ text: "Search", switch_inline_query: "query" }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with copy_text button", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api copy button test",
					reply_markup: {
						inline_keyboard: [[{ text: "Copy", copy_text: { text: "copied text" } }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with maximum length callback_data", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api max callback_data test",
					reply_markup: {
						inline_keyboard: [[{ text: "btn", callback_data: "x".repeat(64) }]],
					},
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with spoiler entity", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "secret",
					entities: [{ type: "spoiler", offset: 0, length: 6 }],
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "secret");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with underline and strikethrough entities", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "formatted",
					entities: [
						{ type: "underline", offset: 0, length: 9 },
						{ type: "strikethrough", offset: 0, length: 9 },
					],
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with blockquote entities", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "quoted",
					entities: [
						{ type: "blockquote", offset: 0, length: 6 },
						{ type: "expandable_blockquote", offset: 0, length: 6 },
					],
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with HTML spoiler and blockquote tags", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<tg-spoiler>secret</tg-spoiler>\n<blockquote expandable>quote</blockquote>",
					parse_mode: "HTML",
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with link preview url override", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "preview override",
					link_preview_options: { url: "https://example.com", prefer_large_media: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with force reply placeholder", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api placeholder test",
					reply_markup: { force_reply: true, input_field_placeholder: "type here" },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with request contact and location keyboard", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
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
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with escaped MarkdownV2 punctuation", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello\\.",
					parse_mode: "MarkdownV2",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "hello.");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message when replying to a missing message with allow_sending_without_reply", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api optional reply test",
					reply_parameters: { message_id: 999999999, allow_sending_without_reply: true },
				});

				assert.strictEqual(typeof message.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with case-insensitive parse_mode", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<b>lower</b>",
					parse_mode: "html",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "lower");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message with automatic entity types", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
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
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MessageTextEmpty when text is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageTextEmpty>(
					error,
					"MessageTextEmpty",
					"Bad Request: message text is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageTextEmpty when text is an empty string", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageTextEmpty>(
					error,
					"MessageTextEmpty",
					"Bad Request: message text is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { text: "test" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is an empty string", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: "", text: "test" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: 0, text: "test" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id is an unresolvable @username", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: "@this_channel_does_not_exist_12345xyz",
					text: "test",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id is a non-numeric string", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: "not_a_chat", text: "test" }).pipe(
					Effect.flip,
				);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageTooLong when text is longer than 4096 characters", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "x".repeat(4097),
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageTooLong>(error, "MessageTooLong", "Bad Request: message is too long");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UnsupportedParseMode when parse_mode is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					parse_mode: "INVALID",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UnsupportedParseMode>(
					error,
					"UnsupportedParseMode",
					"Bad Request: unsupported parse_mode",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesNoEnd when Markdown entity is unclosed", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "*unclosed",
					parse_mode: "Markdown",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesNoEnd>(
					error,
					"CantParseEntitiesNoEnd",
					"Bad Request: can't parse entities: Can't find end of the entity starting at byte offset 0",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesNoBoldEnd when MarkdownV2 bold entity is unclosed", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "*unclosed",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesNoBoldEnd>(
					error,
					"CantParseEntitiesNoBoldEnd",
					"Bad Request: can't parse entities: Can't find end of Bold entity at byte offset 0",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesNoHtmlEndTag when HTML tag is unclosed", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<b>unclosed",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesNoHtmlEndTag>(
					error,
					"CantParseEntitiesNoHtmlEndTag",
					"Bad Request: can't parse entities: Can't find end tag corresponding to start tag \"b\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageThreadNotFound when message_thread_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					message_thread_id: 999999999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageThreadNotFound>(
					error,
					"MessageThreadNotFound",
					"Bad Request: message thread not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToReplyNotFound when reply_parameters.message_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_parameters: { message_id: 999999999 },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToReplyNotFound>(
					error,
					"MessageToReplyNotFound",
					"Bad Request: message to be replied not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("EntityBeginsAfterTextEnd when entity offset is beyond the text", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello",
					entities: [{ type: "bold", offset: 100, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.EntityBeginsAfterTextEnd>(
					error,
					"EntityBeginsAfterTextEnd",
					"Bad Request: entity begins after the end of the text at UTF-16 offset 100",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("EntityEndsAfterTextEnd when entity length exceeds the text", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello",
					entities: [{ type: "bold", offset: 0, length: 100 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.EntityEndsAfterTextEnd>(
					error,
					"EntityEndsAfterTextEnd",
					"Bad Request: entity beginning at UTF-16 offset 0 ends after the end of the text at UTF-16 offset 100",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UnsupportedMessageEntityType when entity type is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello",
					entities: [{ type: "invalid_type", offset: 0, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UnsupportedMessageEntityType>(
					error,
					"UnsupportedMessageEntityType",
					"Bad Request: can't parse MessageEntity: Unsupported type specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ButtonDataInvalid when inline keyboard callback_data is too long", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: {
						inline_keyboard: [[{ text: "btn", callback_data: "x".repeat(100) }]],
					},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ButtonDataInvalid>(
					error,
					"ButtonDataInvalid",
					"Bad Request: BUTTON_DATA_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("BusinessConnectionNotFound when business_connection_id is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					business_connection_id: "invalid",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("EffectIdInvalid when message_effect_id is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					message_effect_id: "9999999999999999999",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.EffectIdInvalid>(error, "EffectIdInvalid", "Bad Request: EFFECT_ID_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("FloodskipNotAllowed when allow_paid_broadcast is true without sufficient Stars", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					allow_paid_broadcast: true,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FloodskipNotAllowed>(
					error,
					"FloodskipNotAllowed",
					"Bad Request: FLOODSKIP_NOT_ALLOWED",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InlineButtonUrlInvalid when inline keyboard url is not a valid HTTP URL", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "link", url: "not-a-url" }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InlineButtonUrlInvalid>(
					error,
					"InlineButtonUrlInvalid",
					"Bad Request: inline keyboard button URL 'not-a-url' is invalid: Wrong HTTP URL",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InlineButtonUrlFtpUnsupported when inline keyboard url uses FTP", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "link", url: "ftp://example.com" }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InlineButtonUrlFtpUnsupported>(
					error,
					"InlineButtonUrlFtpUnsupported",
					"Bad Request: inline keyboard button URL 'ftp://example.com' is invalid: Unsupported URL protocol",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InlineButtonTextUnallowed when inline keyboard button has empty callback_data", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "btn", callback_data: "" }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InlineButtonTextUnallowed>(
					error,
					"InlineButtonTextUnallowed",
					"Bad Request: can't parse inline keyboard button: Text buttons are unallowed in the inline keyboard",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("EntityUrlInvalid when text_link entity url is not valid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "click",
					entities: [{ type: "text_link", offset: 0, length: 5, url: "not-a-url" }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.EntityUrlInvalid>(
					error,
					"EntityUrlInvalid",
					"Bad Request: entity URL 'not-a-url' is invalid: Wrong HTTP URL",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("EntityUrlEmpty when text_link entity url is empty", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "click",
					entities: [{ type: "text_link", offset: 0, length: 5, url: "" }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.EntityUrlEmpty>(
					error,
					"EntityUrlEmpty",
					"Bad Request: entity URL '' is invalid: URL host is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("EntityIncorrectOffset when entity offset is negative", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello",
					entities: [{ type: "bold", offset: -1, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.EntityIncorrectOffset>(
					error,
					"EntityIncorrectOffset",
					"Bad Request: receive an entity with incorrect offset -1",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CustomEmojiIdMustBeNumber when custom_emoji_id is not numeric", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "x",
					entities: [{ type: "custom_emoji", offset: 0, length: 1, custom_emoji_id: "9999999999999999999" }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CustomEmojiIdMustBeNumber>(
					error,
					"CustomEmojiIdMustBeNumber",
					'Bad Request: can\'t parse MessageEntity: Field "custom_emoji_id" must be a valid Number',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UserNotFound when text_mention entity user does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "user",
					entities: [{ type: "text_mention", offset: 0, length: 4, user: { id: 0, is_bot: false, first_name: "X" } }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UserNotFound>(error, "UserNotFound", "Bad Request: user not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharDot when MarkdownV2 period is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello.",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharDot>(
					error,
					"CantParseEntitiesReservedCharDot",
					"Bad Request: can't parse entities: Character '.' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharDash when MarkdownV2 hyphen is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "a-b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharDash>(
					error,
					"CantParseEntitiesReservedCharDash",
					"Bad Request: can't parse entities: Character '-' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharExclamation when MarkdownV2 exclamation is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "hello!",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharExclamation>(
					error,
					"CantParseEntitiesReservedCharExclamation",
					"Bad Request: can't parse entities: Character '!' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesUnsupportedScriptTag when HTML contains script tag", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<script>alert(1)</script>",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesUnsupportedScriptTag>(
					error,
					"CantParseEntitiesUnsupportedScriptTag",
					'Bad Request: can\'t parse entities: Unsupported start tag "script" at byte offset 0',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesUnsupportedTag when HTML contains unknown tag", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<invalid>test</invalid>",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesUnsupportedTag>(
					error,
					"CantParseEntitiesUnsupportedTag",
					'Bad Request: can\'t parse entities: Unsupported start tag "invalid" at byte offset 0',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesUnmatchedEndTag when HTML closing tags are mismatched", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "<b><i>test</b></i>",
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesUnmatchedEndTag>(
					error,
					"CantParseEntitiesUnmatchedEndTag",
					'Bad Request: can\'t parse entities: Unmatched end tag at byte offset 10, expected "</i>", found "</b>"',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ReplyMessageIdMissing when reply_parameters has no message_id", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_parameters: { quote: "hello" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ReplyMessageIdMissing>(
					error,
					"ReplyMessageIdMissing",
					'Bad Request: can\'t find field "message_id"',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("SuggestedPostChannelOnly when suggested_post_parameters is used in a private chat", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					suggested_post_parameters: {},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.SuggestedPostChannelOnly>(
					error,
					"SuggestedPostChannelOnly",
					"Bad Request: suggested posts can be sent only to channel direct messages",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidStarsAmount when suggested_post_parameters price is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					suggested_post_parameters: { price: { currency: "XTR", amount: 1 } },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidStarsAmount>(
					error,
					"InvalidStarsAmount",
					"Bad Request: invalid amount of Telegram Stars specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("WebpageUrlInvalid when link_preview_options.url is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					link_preview_options: { url: "not-a-url" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.WebpageUrlInvalid>(
					error,
					"WebpageUrlInvalid",
					"Bad Request: WEBPAGE_URL_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("PreferSmallMediaMustBeBoolean when link_preview_options.prefer_small_media is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "https://example.com",
					link_preview_options: { prefer_small_media: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PreferSmallMediaMustBeBoolean>(
					error,
					"PreferSmallMediaMustBeBoolean",
					'Bad Request: field "prefer_small_media" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("LinkPreviewIsDisabledMustBeBoolean when link_preview_options.is_disabled is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					link_preview_options: { is_disabled: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.LinkPreviewIsDisabledMustBeBoolean>(
					error,
					"LinkPreviewIsDisabledMustBeBoolean",
					'Bad Request: field "is_disabled" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ForceReplyMustBeBoolean when force_reply is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { force_reply: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ForceReplyMustBeBoolean>(
					error,
					"ForceReplyMustBeBoolean",
					'Bad Request: field "force_reply" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("RemoveKeyboardMustBeBoolean when remove_keyboard is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { remove_keyboard: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.RemoveKeyboardMustBeBoolean>(
					error,
					"RemoveKeyboardMustBeBoolean",
					'Bad Request: field "remove_keyboard" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InlineKeyboardMustBeArray when inline_keyboard is not an array", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: "bad" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InlineKeyboardMustBeArray>(
					error,
					"InlineKeyboardMustBeArray",
					'Bad Request: field "inline_keyboard" must be of type Array',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("SelectiveMustBeBoolean when reply keyboard selective is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { keyboard: [[{ text: "A" }]], selective: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.SelectiveMustBeBoolean>(
					error,
					"SelectiveMustBeBoolean",
					'Bad Request: field "selective" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("OneTimeKeyboardMustBeBoolean when one_time_keyboard is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { keyboard: [[{ text: "A" }]], one_time_keyboard: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.OneTimeKeyboardMustBeBoolean>(
					error,
					"OneTimeKeyboardMustBeBoolean",
					'Bad Request: field "one_time_keyboard" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("IsPersistentMustBeBoolean when is_persistent is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { keyboard: [[{ text: "A" }]], is_persistent: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.IsPersistentMustBeBoolean>(
					error,
					"IsPersistentMustBeBoolean",
					'Bad Request: field "is_persistent" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("WebAppUrlNotHttps when web_app url is not HTTPS", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "app", web_app: { url: "bad" } }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.WebAppUrlNotHttps>(
					error,
					"WebAppUrlNotHttps",
					"Bad Request: inline keyboard button Web App URL 'bad' is invalid: Only HTTPS links are allowed",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("WebAppUrlHttpNotAllowed when web_app url is HTTP", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "app", web_app: { url: "http://example.com" } }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.WebAppUrlHttpNotAllowed>(
					error,
					"WebAppUrlHttpNotAllowed",
					"Bad Request: inline keyboard button Web App URL 'http://example.com' is invalid: Only HTTPS links are allowed",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ButtonTypeInvalid when pay button is used without invoice", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "pay", pay: true }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ButtonTypeInvalid>(
					error,
					"ButtonTypeInvalid",
					"Bad Request: BUTTON_TYPE_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ButtonCopyTextInvalid when copy_text is empty", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "copy", copy_text: { text: "" } }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ButtonCopyTextInvalid>(
					error,
					"ButtonCopyTextInvalid",
					"Bad Request: BUTTON_COPY_TEXT_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ButtonQuantityMaxInvalid when request_users max_quantity is too large", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: {
						keyboard: [[{ text: "users", request_users: { request_id: 1, user_is_bot: true, max_quantity: 999 } }]],
						resize_keyboard: true,
					},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ButtonQuantityMaxInvalid>(
					error,
					"ButtonQuantityMaxInvalid",
					"Bad Request: BUTTON_QUANTITY_MAX_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("LoginUrlBotNotFound when login_url bot_username does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
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

				expectErrorTag<Telegram.Errors.LoginUrlBotNotFound>(
					error,
					"LoginUrlBotNotFound",
					'Bad Request: bot "nonexistent_bot_xyz_12345" not found',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id is negative", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: -1, text: "test" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("TextMustBeNonEmpty when text is whitespace only", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "   ",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.TextMustBeNonEmpty>(
					error,
					"TextMustBeNonEmpty",
					"Bad Request: text must be non-empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("BotDomainInvalid when login_url is missing bot_username", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
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

				expectErrorTag<Telegram.Errors.BotDomainInvalid>(error, "BotDomainInvalid", "Bad Request: BOT_DOMAIN_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesInvalidCustomEmoji when HTML tg-emoji id is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: '<tg-emoji emoji-id="9999999999999999999">x</tg-emoji>',
					parse_mode: "HTML",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesInvalidCustomEmoji>(
					error,
					"CantParseEntitiesInvalidCustomEmoji",
					"Bad Request: can't parse entities: Invalid custom emoji identifier specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CustomEmojiIdMissing when custom_emoji entity has no custom_emoji_id", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "x",
					entities: [{ type: "custom_emoji", offset: 0, length: 1 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CustomEmojiIdMissing>(
					error,
					"CustomEmojiIdMissing",
					"Bad Request: can't parse MessageEntity: Can't find field \"custom_emoji_id\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InlineButtonTextMissing when inline keyboard button has no text", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ callback_data: "x" }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InlineButtonTextMissing>(
					error,
					"InlineButtonTextMissing",
					"Bad Request: can't parse inline keyboard button: Can't find field \"text\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("TextLinkUrlMissing when text_link entity has no url", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "link",
					entities: [{ type: "text_link", offset: 0, length: 4 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.TextLinkUrlMissing>(
					error,
					"TextLinkUrlMissing",
					"Bad Request: can't parse MessageEntity: Can't find field \"url\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("TextMentionUserMissing when text_mention entity has no user", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "user",
					entities: [{ type: "text_mention", offset: 0, length: 4 }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.TextMentionUserMissing>(
					error,
					"TextMentionUserMissing",
					"Bad Request: can't parse MessageEntity: Can't find field \"user\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("KeyboardRequestIdMissing when request_chat button has no request_id", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: {
						keyboard: [[{ text: "chat", request_chat: { chat_is_channel: true } }]],
						resize_keyboard: true,
					},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.KeyboardRequestIdMissing>(
					error,
					"KeyboardRequestIdMissing",
					"Bad Request: can't parse keyboard button: Can't find field \"request_id\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIsForumMustBeBoolean when request_chat.chat_is_forum is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: {
						keyboard: [
							[{ text: "chat", request_chat: { request_id: 1, chat_is_channel: true, chat_is_forum: "yes" } }],
						],
						resize_keyboard: true,
					},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIsForumMustBeBoolean>(
					error,
					"ChatIsForumMustBeBoolean",
					'Bad Request: can\'t parse keyboard button: Field "chat_is_forum" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("KeyboardWebAppUrlHttpNotAllowed when reply keyboard web_app url is HTTP", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: {
						keyboard: [[{ text: "app", web_app: { url: "http://example.com" } }]],
						resize_keyboard: true,
					},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.KeyboardWebAppUrlHttpNotAllowed>(
					error,
					"KeyboardWebAppUrlHttpNotAllowed",
					"Bad Request: keyboard button Web App URL 'http://example.com' is invalid: Only HTTPS links are allowed",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("PreferLargeMediaMustBeBoolean when prefer_large_media is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "https://example.com",
					link_preview_options: { prefer_large_media: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PreferLargeMediaMustBeBoolean>(
					error,
					"PreferLargeMediaMustBeBoolean",
					'Bad Request: field "prefer_large_media" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ShowAboveTextMustBeBoolean when show_above_text is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "https://example.com",
					link_preview_options: { show_above_text: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ShowAboveTextMustBeBoolean>(
					error,
					"ShowAboveTextMustBeBoolean",
					'Bad Request: field "show_above_text" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ResizeKeyboardMustBeBoolean when resize_keyboard is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { keyboard: [[{ text: "A" }]], resize_keyboard: "yes" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ResizeKeyboardMustBeBoolean>(
					error,
					"ResizeKeyboardMustBeBoolean",
					'Bad Request: field "resize_keyboard" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("KeyboardMustBeArray when keyboard is not an array", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { keyboard: "bad" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.KeyboardMustBeArray>(
					error,
					"KeyboardMustBeArray",
					'Bad Request: field "keyboard" must be of type Array',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("AllowUserChatsMustBeBoolean when allow_user_chats is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: {
						inline_keyboard: [[{ text: "q", switch_inline_query_chosen_chat: { allow_user_chats: "yes" } }]],
					},
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.AllowUserChatsMustBeBoolean>(
					error,
					"AllowUserChatsMustBeBoolean",
					'Bad Request: can\'t parse inline keyboard button: Field "allow_user_chats" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("RequestWriteAccessMustBeBoolean when request_write_access is not boolean", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
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
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.RequestWriteAccessMustBeBoolean>(
					error,
					"RequestWriteAccessMustBeBoolean",
					'Bad Request: can\'t parse inline keyboard button: Field "request_write_access" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("LoginUrlBotNotFound when login_url bot_username is not a bot", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
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

				expectErrorTag<Telegram.Errors.LoginUrlBotNotFound>(
					error,
					"LoginUrlBotNotFound",
					'Bad Request: bot "telegram" not found',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesNoBoldEnd when MarkdownV2 nested formatting is unclosed", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "*bold _italic\\_*",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesNoBoldEnd>(
					error,
					"CantParseEntitiesNoBoldEnd",
					"Bad Request: can't parse entities: Can't find end of Bold entity at byte offset 15",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharParen when MarkdownV2 parenthesis is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test()",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharParen>(
					error,
					"CantParseEntitiesReservedCharParen",
					"Bad Request: can't parse entities: Character '(' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharHash when MarkdownV2 hash is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "#tag",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharHash>(
					error,
					"CantParseEntitiesReservedCharHash",
					"Bad Request: can't parse entities: Character '#' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharPlus when MarkdownV2 plus is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "a+b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharPlus>(
					error,
					"CantParseEntitiesReservedCharPlus",
					"Bad Request: can't parse entities: Character '+' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharEquals when MarkdownV2 equals is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "a=b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharEquals>(
					error,
					"CantParseEntitiesReservedCharEquals",
					"Bad Request: can't parse entities: Character '=' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharBrace when MarkdownV2 brace is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "a{b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharBrace>(
					error,
					"CantParseEntitiesReservedCharBrace",
					"Bad Request: can't parse entities: Character '{' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharGreater when MarkdownV2 greater-than is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "a>b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharGreater>(
					error,
					"CantParseEntitiesReservedCharGreater",
					"Bad Request: can't parse entities: Character '>' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesReservedCharPipe when MarkdownV2 pipe is unescaped", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "a|b",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesReservedCharPipe>(
					error,
					"CantParseEntitiesReservedCharPipe",
					"Bad Request: can't parse entities: Character '|' is reserved and must be escaped with the preceding '\\'",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ButtonTypeInvalid when callback_game has no game attached", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "game", callback_game: {} }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ButtonTypeInvalid>(
					error,
					"ButtonTypeInvalid",
					"Bad Request: BUTTON_TYPE_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ButtonCopyTextInvalid when copy_text exceeds 256 characters", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "test",
					reply_markup: { inline_keyboard: [[{ text: "copy", copy_text: { text: "x".repeat(257) } }]] },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ButtonCopyTextInvalid>(
					error,
					"ButtonCopyTextInvalid",
					"Bad Request: BUTTON_COPY_TEXT_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendMessage(token, { chat_id: 1, text: "test" }));
});
