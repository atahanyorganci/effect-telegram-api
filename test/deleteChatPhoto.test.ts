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

const callDeleteChatPhoto = (token: string, payload: unknown) => callClient("deleteChatPhoto", token, payload as never);

liveTests("deleteChatPhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("CantChangePrivateChatPhoto when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callDeleteChatPhoto(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "CantChangePrivateChatPhoto", "Bad Request: can't change private chat photo");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteChatPhoto(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callDeleteChatPhoto(token, { chat_id: 0 }));
});
