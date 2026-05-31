import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";
import { expectEditedMessage } from "./updatingMessagesHelpers.ts";

const callEditMessageLiveLocation = (token: string, payload: unknown) =>
	callClient("editMessageLiveLocation", token, payload as never);

liveTests("editMessageLiveLocation", test => {
	describe("success", () => {
		test.effect("edits a live location message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callClient("sendLocation", botToken, {
					chat_id: chatId,
					latitude: 41.0082,
					longitude: 28.9784,
					live_period: 900,
				});

				const edited = yield* callEditMessageLiveLocation(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
					latitude: 42,
					longitude: 29,
				});
				expectEditedMessage(edited, message.message_id);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToEditNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callEditMessageLiveLocation(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
					latitude: 41.01,
					longitude: 28.98,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: message to edit not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callEditMessageLiveLocation(token, {
			chat_id: 1,
			message_id: 1,
			latitude: 41,
			longitude: 29,
		}),
	);
});
