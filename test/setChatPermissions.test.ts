import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSetChatPermissions = (token: string, payload: unknown) =>
	callClient("setChatPermissions", token, payload as never);

liveTests("setChatPermissions", test => {
	describe("Telegram API errors", () => {
		test.effect("CantChangePrivateChatPermissions when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatPermissions(botToken, {
					chat_id: chatId,
					permissions: { can_send_messages: true },
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: can't change private chat permissions");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatPermissions(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSetChatPermissions(token, { chat_id: 0, permissions: {} }));
});
