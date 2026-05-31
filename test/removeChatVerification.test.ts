import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callRemoveChatVerification = (token: string, payload: unknown) =>
	callClient("removeChatVerification", token, payload as never);

liveTests("removeChatVerification", test => {
	describe("Telegram API errors", () => {
		test.effect("BotVerifierForbidden when the bot cannot remove verification for the private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callRemoveChatVerification(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: BOT_VERIFIER_FORBIDDEN");
			}),
		);

		test.effect("InvalidChatIdentifier when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRemoveChatVerification(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: invalid chat identifier specified");
			}),
		);
	});

	authErrorTests(test, token => callRemoveChatVerification(token, { chat_id: 0 }));
});
