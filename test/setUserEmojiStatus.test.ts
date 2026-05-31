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

const callSetUserEmojiStatus = (token: string, payload: unknown) =>
	callClient("setUserEmojiStatus", token, payload as never);

liveTests("setUserEmojiStatus", test => {
	describe("Telegram API errors", () => {
		test.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetUserEmojiStatus(botToken, {
					user_id: 1,
					emoji_status_custom_emoji_id: "1",
				}).pipe(Effect.flip);

				expectErrorTag(error, "UserNotFound", "Bad Request: user not found");
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetUserEmojiStatus(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSetUserEmojiStatus(token, { user_id: 0 }));
});
