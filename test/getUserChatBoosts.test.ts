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

const callGetUserChatBoosts = (token: string, payload: unknown) =>
	callClient("getUserChatBoosts", token, payload as never);

liveTests("getUserChatBoosts", test => {
	describe("success", () => {
		test.effect("returns boosts for a user in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, chatId, groupId } = yield* telegramConfig;
				const boosts = yield* callGetUserChatBoosts(botToken, {
					chat_id: groupId,
					user_id: chatId,
				});

				assert.ok(Array.isArray(boosts.boosts));
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("PeerIdInvalid when chat_id is not a boost-enabled channel or supergroup", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const me = yield* callClient("getMe", token);
				const error = yield* callGetUserChatBoosts(token, {
					chat_id: chatId,
					user_id: me.id,
				}).pipe(Effect.flip);

				expectErrorTag(error, "PeerIdInvalid", "Bad Request: PEER_ID_INVALID");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserChatBoosts(botToken, { chat_id: 0, user_id: 1 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetUserChatBoosts(botToken, {}));
			}),
		);

		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetUserChatBoosts(botToken, { chat_id: 1 }));
			}),
		);
	});

	authErrorTests(test, token => callGetUserChatBoosts(token, { chat_id: 1, user_id: 1 }));
});
