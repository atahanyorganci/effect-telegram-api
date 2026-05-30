import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetUserGifts = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getUserGifts, payload);

describe("getUserGifts", () => {
	describe("success", () => {
		it.effect("returns owned gifts for the authenticated bot user", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const me = yield* Telegram.Client.callMethod(token, Telegram.Methods.getMe);
				const gifts = yield* callGetUserGifts(token, { user_id: me.id });

				assert.strictEqual(typeof gifts.total_count, "number");
				assert.ok(Array.isArray(gifts.gifts));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserGifts(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserGifts(botToken, { user_id: 999_999_999_999 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UserNotFound>(error, "UserNotFound", "Bad Request: user not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetUserGifts(token, { user_id: 1 }));
});
