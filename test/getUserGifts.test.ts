import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callGetUserGifts = (token: string, payload: unknown) => callClient("getUserGifts", token, payload as never);

liveTests("getUserGifts", test => {
	describe("success", () => {
		test.effect("returns owned gifts for the authenticated bot user", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const me = yield* callClient("getMe", token);
				const gifts = yield* callGetUserGifts(token, { user_id: me.id });

				assert.strictEqual(typeof gifts.total_count, "number");
				assert.ok(Array.isArray(gifts.gifts));
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetUserGifts(botToken, {}));
			}),
		);

		test.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserGifts(botToken, { user_id: 999_999_999_999 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: user not found");
			}),
		);
	});

	authErrorTests(test, token => callGetUserGifts(token, { user_id: 1 }));
});
