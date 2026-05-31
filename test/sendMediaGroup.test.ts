import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendMediaGroup = (token: string, payload: unknown) => callClient("sendMediaGroup", token, payload as never);

liveTests("sendMediaGroup", test => {
	describe("Telegram API errors", () => {
		test.effect("MediaRequired when media is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendMediaGroup(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token =>
		callSendMediaGroup(token, { chat_id: 1, media: [{ type: "photo", media: "attach://file" }] }),
	);
});
