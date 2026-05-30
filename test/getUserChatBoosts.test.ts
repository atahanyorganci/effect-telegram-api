import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetUserChatBoosts = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getUserChatBoosts, payload);

describe("getUserChatBoosts", () => {
	describe("success", () => {
		it.effect("returns boosts for a user in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, chatId, groupId } = yield* telegramConfig;
				const boosts = yield* callGetUserChatBoosts(botToken, {
					chat_id: groupId,
					user_id: chatId,
				});

				assert.ok(Array.isArray(boosts.boosts));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("PeerIdInvalid when chat_id is not a boost-enabled channel or supergroup", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const me = yield* Telegram.Client.callMethod(token, Telegram.Methods.getMe);
				const error = yield* callGetUserChatBoosts(token, {
					chat_id: chatId,
					user_id: me.id,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PeerIdInvalid>(error, "PeerIdInvalid", "Bad Request: PEER_ID_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserChatBoosts(botToken, { chat_id: 0, user_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserChatBoosts(botToken, { user_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserChatBoosts(botToken, { chat_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetUserChatBoosts(token, { chat_id: 1, user_id: 1 }));
});
