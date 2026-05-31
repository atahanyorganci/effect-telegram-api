import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";
import { expectEditedMessage, sendPhoto, testPhotoUrl } from "./updatingMessagesHelpers.ts";

const callEditMessageCaption = (token: string, payload: unknown) =>
	callClient("editMessageCaption", token, payload as never);

liveTests("editMessageCaption", test => {
	describe("success", () => {
		test.effect("edits caption on a photo message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* sendPhoto(botToken, {
					chat_id: chatId,
					photo: testPhotoUrl,
					caption: "telegram-api original caption",
				});

				const edited = yield* callEditMessageCaption(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
					caption: "telegram-api edited caption",
				});
				expectEditedMessage(edited, message.message_id);
				assert.strictEqual((edited as { readonly caption?: string }).caption, "telegram-api edited caption");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToEditNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callEditMessageCaption(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
					caption: "telegram-api missing caption target",
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToEditNotFound", "Bad Request: message to edit not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callEditMessageCaption(token, {
			chat_id: 1,
			message_id: 1,
			caption: "telegram-api auth test",
		}),
	);
});
