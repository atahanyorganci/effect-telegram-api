import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";
import { expectEditedMessage, sendPhoto, testPhotoUrl } from "./updatingMessagesHelpers.ts";

const callEditMessageMedia = (token: string, payload: unknown) =>
	callClient("editMessageMedia", token, payload as never);

liveTests("editMessageMedia", test => {
	describe("success", () => {
		test.effect("edits media on a photo message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* sendPhoto(botToken, {
					chat_id: chatId,
					photo: testPhotoUrl,
					caption: "telegram-api original caption",
				});
				const photo = message.photo?.at(-1);
				assert.notStrictEqual(photo, undefined);

				const edited = yield* callEditMessageMedia(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
					media: {
						type: "photo",
						media: photo!.file_id,
						caption: "telegram-api edited media caption",
					},
				});
				expectEditedMessage(edited, message.message_id);
				assert.strictEqual((edited as { readonly caption?: string }).caption, "telegram-api edited media caption");
			}),
		);
	});

	authErrorTests(test, token =>
		callEditMessageMedia(token, {
			chat_id: 1,
			message_id: 1,
			media: { type: "photo", media: "invalid" },
		}),
	);
});
