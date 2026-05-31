import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendAnimation = (token: string, payload: unknown = {}) =>
	callClient("sendAnimation", token, payload as never);

liveTests("sendAnimation", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when animation is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendAnimation(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSendAnimation(token, { chat_id: 1, animation: "invalid" }));
});
