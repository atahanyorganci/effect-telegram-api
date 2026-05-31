import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendGift = (token: string, payload: unknown) => callClient("sendGift", token, payload as never);

liveTests("sendGift", test => {
	describe("Telegram API errors", () => {
		test.effect("StargiftInvalid when gift_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendGift(botToken, { user_id: chatId }));
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendGift(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSendGift(token, { gift_id: "invalid" }));
});
