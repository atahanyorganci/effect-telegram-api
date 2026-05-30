import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetUserEmojiStatus = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setUserEmojiStatus, payload);

describe("setUserEmojiStatus", () => {
	describe("Telegram API errors", () => {
		it.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetUserEmojiStatus(botToken, {
					user_id: 1,
					emoji_status_custom_emoji_id: "1",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UserNotFound>(error, "UserNotFound", "Bad Request: user not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetUserEmojiStatus(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetUserEmojiStatus(token, { user_id: 0 }));
});
