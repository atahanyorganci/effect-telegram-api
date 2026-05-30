import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetChatAdministrators = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getChatAdministrators, payload);

describe("getChatAdministrators", () => {
	describe("success", () => {
		it.effect("returns administrators for the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const administrators = yield* callGetChatAdministrators(botToken, { chat_id: groupId });

				assert.ok(administrators.length > 0);
				assert.strictEqual(typeof (administrators[0] as { readonly status: string }).status, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatAdministrators(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatAdministrators(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetChatAdministrators(token, { chat_id: 1 }));
});
