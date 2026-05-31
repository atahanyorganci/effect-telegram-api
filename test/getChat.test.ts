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

const callGetChat = (token: string, payload: unknown) => callClient("getChat", token, payload as never);

liveTests("getChat", test => {
	describe("success", () => {
		test.effect("returns chat info for a valid chat_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const chat = yield* callGetChat(botToken, { chat_id: chatId });

				assert.strictEqual(typeof chat.id, "number");
				assert.strictEqual(typeof chat.type, "string");
			}),
		);

		test.effect("returns supergroup info for the test group chat_id", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const chat = yield* callGetChat(botToken, { chat_id: groupId });

				assert.strictEqual(chat.id, groupId);
				assert.strictEqual(chat.type, "supergroup");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChat(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetChat(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetChat(token, { chat_id: 1 }));
});
