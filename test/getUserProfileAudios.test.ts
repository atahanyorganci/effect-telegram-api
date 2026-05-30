import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetUserProfileAudios = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getUserProfileAudios, payload);

describe("getUserProfileAudios", () => {
	describe("success", () => {
		it.effect("returns profile audio metadata for the authenticated bot user", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const me = yield* Telegram.Client.callMethod(token, Telegram.Methods.getMe);
				const audios = yield* callGetUserProfileAudios(token, { user_id: me.id });

				assert.strictEqual(typeof audios.total_count, "number");
				assert.ok(Array.isArray(audios.audios));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserProfileAudios(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserProfileAudios(botToken, { user_id: 999_999_999_999 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UserNotFound>(error, "UserNotFound", "Bad Request: user not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetUserProfileAudios(token, { user_id: 1 }));
});
