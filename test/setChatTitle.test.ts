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

const callSetChatTitle = (token: string, payload: unknown) => callClient("setChatTitle", token, payload as never);

liveTests("setChatTitle", test => {
	describe("Telegram API errors", () => {
		test.effect("CantChangePrivateChatTitle when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatTitle(botToken, { chat_id: chatId, title: "probe" }).pipe(Effect.flip);

				expectErrorTag(error, "CantChangePrivateChatTitle", "Bad Request: can't change private chat title");
			}),
		);

		test.effect("TitleEmpty when title is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatTitle(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSetChatTitle(token, { chat_id: 1, title: "test" }));
});
