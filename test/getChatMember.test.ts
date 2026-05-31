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

const callGetChatMember = (token: string, payload: unknown) => callClient("getChatMember", token, payload as never);

liveTests("getChatMember", test => {
	describe("success", () => {
		test.effect("returns the bot member record for a valid chat_id and user_id", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const me = yield* callClient("getMe", token);
				const member = yield* callGetChatMember(token, { chat_id: chatId, user_id: me.id });
				const chatMember = member as { readonly user: { readonly id: number }; readonly status: string };

				assert.strictEqual(chatMember.user.id, me.id);
				assert.strictEqual(typeof chatMember.status, "string");
			}),
		);

		test.effect("returns the bot administrator record in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken: token, groupId } = yield* telegramConfig;
				const me = yield* callClient("getMe", token);
				const member = yield* callGetChatMember(token, { chat_id: groupId, user_id: me.id });
				const chatMember = member as { readonly user: { readonly id: number }; readonly status: string };

				assert.strictEqual(chatMember.user.id, me.id);
				assert.strictEqual(chatMember.status, "administrator");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, { chat_id: 0, user_id: 1 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetChatMember(botToken, {}));
			}),
		);

		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetChatMember(botToken, { chat_id: 1 }));
			}),
		);

		test.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, { chat_id: groupId, user_id: 1 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);

		test.effect("MemberNotFound when user_id is not a member of the chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, {
					chat_id: chatId,
					user_id: 999_999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: member not found");
			}),
		);
	});

	authErrorTests(test, token => callGetChatMember(token, { chat_id: 1, user_id: 1 }));
});
