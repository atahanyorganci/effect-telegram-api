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

const callSendChatAction = (token: string, payload: unknown) => callClient("sendChatAction", token, payload as never);

liveTests("sendChatAction", test => {
	describe("success", () => {
		test.effect("returns true when broadcasting a typing action", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const result = yield* callSendChatAction(botToken, {
					chat_id: chatId,
					action: "typing",
				});

				assert.strictEqual(result, true);
			}),
		);

		test.effect("returns true when broadcasting a typing action in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const result = yield* callSendChatAction(botToken, {
					chat_id: groupId,
					action: "typing",
				});

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendChatAction(botToken, {}));
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendChatAction(botToken, { chat_id: 0, action: "typing" }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("WrongParameterAction when action is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendChatAction(botToken, { chat_id: chatId }));
			}),
		);

		test.effect("WrongParameterAction when action is not supported", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendChatAction(botToken, {
					chat_id: chatId,
					action: "invalid",
				}).pipe(Effect.flip);

				expectErrorTag(error, "WrongParameterAction", "Bad Request: wrong parameter action in request");
			}),
		);
	});

	authErrorTests(test, token => callSendChatAction(token, { chat_id: 1, action: "typing" }));
});
