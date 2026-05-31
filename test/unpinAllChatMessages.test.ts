import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callUnpinAllChatMessages = (token: string, payload: unknown) =>
	callClient("unpinAllChatMessages", token, payload as never);

liveTests("unpinAllChatMessages", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callUnpinAllChatMessages(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callUnpinAllChatMessages(token, { chat_id: 0 }));
});
