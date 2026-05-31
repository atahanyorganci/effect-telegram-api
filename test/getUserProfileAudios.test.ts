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

const callGetUserProfileAudios = (token: string, payload: unknown) =>
	callClient("getUserProfileAudios", token, payload as never);

liveTests("getUserProfileAudios", test => {
	describe("success", () => {
		test.effect("returns profile audio metadata for the authenticated bot user", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const me = yield* callClient("getMe", token);
				const audios = yield* callGetUserProfileAudios(token, { user_id: me.id });

				assert.strictEqual(typeof audios.total_count, "number");
				assert.ok(Array.isArray(audios.audios));
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetUserProfileAudios(botToken, {}));
			}),
		);

		test.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserProfileAudios(botToken, { user_id: 999_999_999_999 }).pipe(Effect.flip);

				expectErrorTag(error, "UserNotFound", "Bad Request: user not found");
			}),
		);
	});

	authErrorTests(test, token => callGetUserProfileAudios(token, { user_id: 1 }));
});
