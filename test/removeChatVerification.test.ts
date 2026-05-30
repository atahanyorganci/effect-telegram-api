import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callRemoveChatVerification = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.removeChatVerification, payload);

describe("removeChatVerification", () => {
	describe("Telegram API errors", () => {
		it.effect("BotVerifierForbidden when the bot cannot remove verification for the private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callRemoveChatVerification(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BotVerifierForbidden>(
					error,
					"BotVerifierForbidden",
					"Bad Request: BOT_VERIFIER_FORBIDDEN",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidChatIdentifier when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRemoveChatVerification(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidChatIdentifier>(
					error,
					"InvalidChatIdentifier",
					"Bad Request: invalid chat identifier specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callRemoveChatVerification(token, { chat_id: 0 }));
});
