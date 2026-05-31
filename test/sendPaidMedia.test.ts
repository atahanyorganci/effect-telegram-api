import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendPaidMedia = (token: string, payload: unknown) => callClient("sendPaidMedia", token, payload as never);

liveTests("sendPaidMedia", test => {
	describe("Telegram API errors", () => {
		test.effect("MediaRequired when media is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendPaidMedia(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token =>
		callSendPaidMedia(token, { chat_id: 1, star_count: 1, media: [{ type: "photo", media: "attach://file" }] }),
	);
});
