import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatDescription = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatDescription, payload);

describe("setChatDescription", () => {
	describe("success", () => {
		it.effect("returns true when updating and restoring the supergroup description", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const chat = yield* Telegram.Client.callMethod(botToken, Telegram.Methods.getChat, { chat_id: groupId });
				const original = "description" in chat && typeof chat.description === "string" ? chat.description : "";

				yield* callSetChatDescription(botToken, {
					chat_id: groupId,
					description: `${original} integration-test`,
				});
				const result = yield* callSetChatDescription(botToken, {
					chat_id: groupId,
					description: original,
				});

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("CantChangePrivateChatDescription when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatDescription(botToken, {
					chat_id: chatId,
					description: "probe",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantChangePrivateChatDescription>(
					error,
					"CantChangePrivateChatDescription",
					"Bad Request: can't change private chat description",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetChatDescription(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatDescription(token, { chat_id: 0 }));
});
