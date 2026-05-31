import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSendAnimation = (token: string, payload: unknown = {}) =>
	callClient("sendAnimation", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("sendAnimation", test => {
	describe("Telegram API errors", () => {
		test.effect("NoAnimationInRequest when animation is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendAnimation(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoAnimationInRequest", "Bad Request: there is no animation in the request");
			}),
		);
	});

	authErrorTests(test, token => callSendAnimation(token, { chat_id: 1, animation: "invalid" }));
});
