import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetChatMember = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getChatMember, payload);

describe("getChatMember", () => {
	describe("success", () => {
		it.effect("returns the bot member record for a valid chat_id and user_id", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const me = yield* Telegram.Client.callMethod(token, Telegram.Methods.getMe);
				const member = yield* callGetChatMember(token, { chat_id: chatId, user_id: me.id });
				const chatMember = member as { readonly user: { readonly id: number }; readonly status: string };

				assert.strictEqual(chatMember.user.id, me.id);
				assert.strictEqual(typeof chatMember.status, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, { chat_id: 0, user_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, { user_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, { chat_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MemberNotFound when user_id is not a member of the chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callGetChatMember(botToken, {
					chat_id: chatId,
					user_id: 999_999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MemberNotFound>(error, "MemberNotFound", "Bad Request: member not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetChatMember(token, { chat_id: 1, user_id: 1 }));
});
