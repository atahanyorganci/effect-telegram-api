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

const callGiftPremiumSubscription = (token: string, payload: unknown) =>
	callClient("giftPremiumSubscription", token, payload as never);

liveTests("giftPremiumSubscription", test => {
	describe("Telegram API errors", () => {
		test.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGiftPremiumSubscription(botToken, {
					user_id: 999_999_999,
					month_count: 1,
					star_count: 100,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: user not found");
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGiftPremiumSubscription(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGiftPremiumSubscription(token, { user_id: 0, month_count: 1, star_count: 1 }));
});
