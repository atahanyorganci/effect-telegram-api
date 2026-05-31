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

const callGetChatMemberCount = (token: string, payload: unknown) =>
	callClient("getChatMemberCount", token, payload as never);

liveTests("getChatMemberCount", test => {
	describe("success", () => {
		test.effect("returns the member count for a valid chat_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const count = yield* callGetChatMemberCount(botToken, { chat_id: chatId });

				assert.strictEqual(typeof count, "number");
				assert.ok(count >= 0);
			}),
		);

		test.effect("returns the member count for the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const count = yield* callGetChatMemberCount(botToken, { chat_id: groupId });

				assert.strictEqual(typeof count, "number");
				assert.ok(count >= 2);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMemberCount(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetChatMemberCount(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetChatMemberCount(token, { chat_id: 1 }));
});
