import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetChatMemberCount = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getChatMemberCount, payload);

describe("getChatMemberCount", () => {
	describe("success", () => {
		it.effect("returns the member count for a valid chat_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const count = yield* callGetChatMemberCount(botToken, { chat_id: chatId });

				assert.strictEqual(typeof count, "number");
				assert.ok(count >= 0);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMemberCount(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMemberCount(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetChatMemberCount(token, { chat_id: 1 }));
});
