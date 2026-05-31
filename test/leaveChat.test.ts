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

const callLeaveChat = (token: string, payload: unknown) => callClient("leaveChat", token, payload as never);

liveTests("leaveChat", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatMemberStatusCantBeChangedInPrivateChats when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callLeaveChat(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(
					error,
					"ChatMemberStatusCantBeChangedInPrivateChats",
					"Bad Request: chat member status can't be changed in private chats",
				);
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callLeaveChat(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callLeaveChat(token, { chat_id: 0 }));
});
