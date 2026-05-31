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

const callGetChatAdministrators = (token: string, payload: unknown) =>
	callClient("getChatAdministrators", token, payload as never);

liveTests("getChatAdministrators", test => {
	describe("success", () => {
		test.effect("returns administrators for the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const administrators = yield* callGetChatAdministrators(botToken, { chat_id: groupId });

				assert.ok(administrators.length > 0);
				assert.strictEqual(typeof (administrators[0] as { readonly status: string }).status, "string");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatAdministrators(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetChatAdministrators(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetChatAdministrators(token, { chat_id: 1 }));
});
