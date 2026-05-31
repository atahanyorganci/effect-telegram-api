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

const callGetUserProfilePhotos = (token: string, payload: unknown) =>
	callClient("getUserProfilePhotos", token, payload as never);

liveTests("getUserProfilePhotos", test => {
	describe("success", () => {
		test.effect("returns profile photo metadata for the authenticated bot user", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const me = yield* callClient("getMe", token);
				const photos = yield* callGetUserProfilePhotos(token, { user_id: me.id });

				assert.strictEqual(typeof photos.total_count, "number");
				assert.ok(Array.isArray(photos.photos));
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetUserProfilePhotos(botToken, {}));
			}),
		);

		test.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserProfilePhotos(botToken, { user_id: 999_999_999_999 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: user not found");
			}),
		);
	});

	authErrorTests(test, token => callGetUserProfilePhotos(token, { user_id: 1 }));
});
