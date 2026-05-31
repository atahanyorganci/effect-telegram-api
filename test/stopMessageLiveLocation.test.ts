import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";
import { expectEditedMessage } from "./updatingMessagesHelpers.ts";

const callStopMessageLiveLocation = (token: string, payload: unknown) =>
	callClient("stopMessageLiveLocation", token, payload as never);

liveTests("stopMessageLiveLocation", test => {
	describe("success", () => {
		test.effect("stops a live location message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callClient("sendLocation", botToken, {
					chat_id: chatId,
					latitude: 41.0082,
					longitude: 28.9784,
					live_period: 900,
				});

				const stopped = yield* callStopMessageLiveLocation(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
				});
				expectEditedMessage(stopped, message.message_id);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToEditNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callStopMessageLiveLocation(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: message to edit not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callStopMessageLiveLocation(token, {
			chat_id: 1,
			message_id: 1,
		}),
	);
});
