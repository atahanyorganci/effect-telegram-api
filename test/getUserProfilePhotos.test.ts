import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetUserProfilePhotos = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getUserProfilePhotos, payload);

describe("getUserProfilePhotos", () => {
	describe("success", () => {
		it.effect("returns profile photo metadata for the authenticated bot user", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const me = yield* Telegram.Client.callMethod(token, Telegram.Methods.getMe);
				const photos = yield* callGetUserProfilePhotos(token, { user_id: me.id });

				assert.strictEqual(typeof photos.total_count, "number");
				assert.ok(Array.isArray(photos.photos));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callGetUserProfilePhotos(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callGetUserProfilePhotos(requireBotToken(), { user_id: 999_999_999_999 }).pipe(
					Effect.flip,
				);

				expectErrorTag<Telegram.Errors.UserNotFound>(error, "UserNotFound", "Bad Request: user not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetUserProfilePhotos(token, { user_id: 1 }));
});
