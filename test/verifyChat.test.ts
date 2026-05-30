import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callVerifyChat = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.verifyChat, payload);

describe("verifyChat", () => {
	describe("Telegram API errors", () => {
		it.effect("BotVerifierForbidden when the bot cannot verify the private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callVerifyChat(botToken, {
					chat_id: chatId,
					custom_description: "probe",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BotVerifierForbidden>(
					error,
					"BotVerifierForbidden",
					"Bad Request: BOT_VERIFIER_FORBIDDEN",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callVerifyChat(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callVerifyChat(token, { chat_id: 0 }));
});
