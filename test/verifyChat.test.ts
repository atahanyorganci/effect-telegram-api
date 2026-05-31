import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callVerifyChat = (token: string, payload: unknown) => callClient("verifyChat", token, payload as never);

liveTests("verifyChat", test => {
	describe("Telegram API errors", () => {
		test.effect("BotVerifierForbidden when the bot cannot verify the private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callVerifyChat(botToken, {
					chat_id: chatId,
					custom_description: "probe",
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: BOT_VERIFIER_FORBIDDEN");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callVerifyChat(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callVerifyChat(token, { chat_id: 0 }));
});
